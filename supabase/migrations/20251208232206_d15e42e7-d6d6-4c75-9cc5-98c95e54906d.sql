-- Update the grading function with new point values
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

  -- NEW POINT VALUES:
  -- Excellent (A): 90-100 points -> use 95 (midpoint)
  -- Very Good (B): 80-89 points -> use 84.5 (midpoint)
  -- Good (C): 60-79 points -> use 69.5 (midpoint)
  -- Poor (D): 35-59 points -> use 47 (midpoint)
  -- Replace/Fail (F): 0-34 points -> use 17 (midpoint)
  
  -- Non-critical items
  v_total_points_earned := 
    ((v_excellent_count - v_critical_excellent) * 95) + 
    ((v_very_good_count - v_critical_very_good) * 84.5) + 
    ((v_good_count - v_critical_good) * 69.5) + 
    ((v_poor_count - v_critical_poor) * 47) +
    ((v_replace_count - v_critical_replace) * 17);
  
  -- Critical items with severity multiplier
  v_total_points_earned := v_total_points_earned + (
    (v_critical_excellent * 95 * v_severity_multiplier) + 
    (v_critical_very_good * 84.5 * v_severity_multiplier) + 
    (v_critical_good * 69.5 * v_severity_multiplier) + 
    (v_critical_poor * 47 * v_severity_multiplier) +
    (v_critical_replace * 17 * v_severity_multiplier)
  );

  -- Calculate total possible points (max is 95 per item, or 95*1.5 for critical)
  v_total_points_possible := 
    ((v_total_items_rated - v_critical_total) * 95) + 
    (v_critical_total * 95 * v_severity_multiplier);

  v_percentage := (v_total_points_earned / v_total_points_possible) * 100;

  -- Determine letter grade based on new thresholds
  -- A (Excellent): 90-100%
  -- B (Very Good): 80-89%
  -- C (Good): 60-79%
  -- D (Poor): 35-59%
  -- F (Replace/Fail): 0-34%
  IF v_percentage >= 90 THEN
    v_grade_letter := 'A';
  ELSIF v_percentage >= 80 THEN
    v_grade_letter := 'B';
  ELSIF v_percentage >= 60 THEN
    v_grade_letter := 'C';
  ELSIF v_percentage >= 35 THEN
    v_grade_letter := 'D';
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