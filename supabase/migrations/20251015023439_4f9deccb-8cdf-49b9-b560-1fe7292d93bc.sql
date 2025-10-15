-- Update the grade calculation function with new grading logic
CREATE OR REPLACE FUNCTION public.calculate_inspection_grade_v2(_inspection_id uuid)
RETURNS TABLE(grade_numeric numeric, grade_letter text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_excellent_count INTEGER := 0;
  v_very_good_count INTEGER := 0;
  v_good_count INTEGER := 0;
  v_poor_count INTEGER := 0;
  v_replace_count INTEGER := 0;
  v_not_inspected_count INTEGER := 0;
  v_partial_inspected_count INTEGER := 0;
  v_total_items_rated INTEGER := 0;
  v_total_points_earned NUMERIC := 0;
  v_total_points_possible NUMERIC := 0;
  v_percentage NUMERIC := 0;
  v_grade_letter TEXT;
  
  -- Critical category tracking
  v_critical_excellent INTEGER := 0;
  v_critical_very_good INTEGER := 0;
  v_critical_good INTEGER := 0;
  v_critical_poor INTEGER := 0;
  v_critical_replace INTEGER := 0;
  v_critical_total INTEGER := 0;
  v_severity_multiplier NUMERIC := 1.5;
BEGIN
  -- Count ratings from checklist_items table
  SELECT 
    COUNT(*) FILTER (WHERE rating = 'Excellent'),
    COUNT(*) FILTER (WHERE rating = 'Very Good'),
    COUNT(*) FILTER (WHERE rating = 'Good'),
    COUNT(*) FILTER (WHERE rating = 'Poor'),
    COUNT(*) FILTER (WHERE rating = 'Replace'),
    COUNT(*) FILTER (WHERE rating = 'Not Inspected'),
    COUNT(*) FILTER (WHERE rating = 'Partial Inspected')
  INTO 
    v_excellent_count,
    v_very_good_count,
    v_good_count,
    v_poor_count,
    v_replace_count,
    v_not_inspected_count,
    v_partial_inspected_count
  FROM public.checklist_items
  WHERE inspection_id = _inspection_id;

  -- Count critical category items (Foundation, Roof, Structure)
  SELECT 
    COUNT(*) FILTER (WHERE rating = 'Excellent'),
    COUNT(*) FILTER (WHERE rating = 'Very Good'),
    COUNT(*) FILTER (WHERE rating = 'Good'),
    COUNT(*) FILTER (WHERE rating = 'Poor'),
    COUNT(*) FILTER (WHERE rating = 'Replace'),
    COUNT(*)
  INTO 
    v_critical_excellent,
    v_critical_very_good,
    v_critical_good,
    v_critical_poor,
    v_critical_replace,
    v_critical_total
  FROM public.checklist_items
  WHERE inspection_id = _inspection_id
    AND category IN ('Foundation', 'Roof', 'Structure');

  v_total_items_rated := v_excellent_count + v_very_good_count + v_good_count + v_poor_count + v_replace_count;

  IF v_total_items_rated = 0 THEN
    UPDATE public.inspections
    SET 
      total_items_rated = 0,
      total_points_earned = 0,
      total_points_possible = 0,
      final_grade_numeric = 0,
      final_grade_letter = 'F',
      excellent_count = 0,
      very_good_count = 0,
      good_count = 0,
      poor_count = 0,
      replace_count = 0,
      not_inspected_count = v_not_inspected_count,
      partial_inspected_count = v_partial_inspected_count,
      grade_calculated_at = NOW()
    WHERE id = _inspection_id;
    
    RETURN QUERY SELECT 0::NUMERIC, 'F'::TEXT;
    RETURN;
  END IF;

  -- Calculate points with severity multipliers
  -- Base points: Excellent=100, Very Good=87.5, Good=75, Poor=42.5, Replace=0
  -- Non-critical items
  v_total_points_earned := 
    ((v_excellent_count - v_critical_excellent) * 100) + 
    ((v_very_good_count - v_critical_very_good) * 87.5) + 
    ((v_good_count - v_critical_good) * 75) + 
    ((v_poor_count - v_critical_poor) * 42.5);
  
  -- Critical items with severity multiplier
  v_total_points_earned := v_total_points_earned + (
    (v_critical_excellent * 100 * v_severity_multiplier) + 
    (v_critical_very_good * 87.5 * v_severity_multiplier) + 
    (v_critical_good * 75 * v_severity_multiplier) + 
    (v_critical_poor * 42.5 * v_severity_multiplier)
  );

  -- Calculate total possible points
  v_total_points_possible := 
    ((v_total_items_rated - v_critical_total) * 100) + 
    (v_critical_total * 100 * v_severity_multiplier);

  v_percentage := (v_total_points_earned / v_total_points_possible) * 100;

  -- Apply defect penalty (each Replace item reduces score by additional 2%)
  IF v_replace_count > 0 THEN
    v_percentage := v_percentage - (v_replace_count * 2);
    IF v_percentage < 0 THEN
      v_percentage := 0;
    END IF;
  END IF;

  -- Determine letter grade
  IF v_percentage >= 95 THEN
    v_grade_letter := 'A+';
  ELSIF v_percentage >= 85 THEN
    v_grade_letter := 'A';
  ELSIF v_percentage >= 70 THEN
    v_grade_letter := 'B';
  ELSIF v_percentage >= 50 THEN
    v_grade_letter := 'C';
  ELSE
    v_grade_letter := 'F';
  END IF;

  UPDATE public.inspections
  SET 
    total_items_rated = v_total_items_rated,
    total_points_earned = v_total_points_earned,
    total_points_possible = v_total_points_possible,
    final_grade_numeric = v_percentage,
    final_grade_letter = v_grade_letter,
    excellent_count = v_excellent_count,
    very_good_count = v_very_good_count,
    good_count = v_good_count,
    poor_count = v_poor_count,
    replace_count = v_replace_count,
    not_inspected_count = v_not_inspected_count,
    partial_inspected_count = v_partial_inspected_count,
    grade_calculated_at = NOW()
  WHERE id = _inspection_id;

  RETURN QUERY SELECT v_percentage, v_grade_letter;
END;
$function$;