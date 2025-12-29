CREATE OR REPLACE FUNCTION public.calculate_inspection_grade_v2(_inspection_id uuid)
 RETURNS TABLE(grade_numeric numeric, grade_letter text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_inspector_id uuid;
  v_category_weights jsonb := '{
    "Foundation & Structure": 0.25,
    "Foundation": 0.25,
    "Structure": 0.25,
    "Roof": 0.20,
    "Plumbing": 0.12,
    "Electric": 0.12,
    "Electrical": 0.12,
    "Heating & Cooling": 0.10,
    "HVAC": 0.10,
    "Exterior Cladding": 0.08,
    "Exterior": 0.08,
    "Doors & Windows": 0.05,
    "Wood Decks & Balconies": 0.03,
    "Decks": 0.03,
    "Walkways/Patios/Driveways": 0.03,
    "Walkways": 0.03,
    "Built-in Appliances": 0.02,
    "Appliances": 0.02
  }'::jsonb;

  v_rating_points jsonb := '{
    "Excellent": 100,
    "Very Good": 87.5,
    "Good": 75,
    "Poor": 42.5,
    "Replace": 0
  }'::jsonb;

  -- Counters
  v_excellent_count INTEGER := 0;
  v_very_good_count INTEGER := 0;
  v_good_count INTEGER := 0;
  v_poor_count INTEGER := 0;
  v_replace_count INTEGER := 0;
  v_not_inspected_count INTEGER := 0;
  v_partial_inspected_count INTEGER := 0;
  v_total_items_rated INTEGER := 0;

  -- Category scores
  v_category_scores jsonb := '{}'::jsonb;
  v_category_data RECORD;
  v_category_weight NUMERIC;
  v_category_total_points NUMERIC;
  v_category_max_points NUMERIC;
  v_category_score NUMERIC;
  v_category_grade TEXT;
  v_weighted_total NUMERIC := 0;
  v_total_weight_used NUMERIC := 0;

  -- Defect scoring
  v_defect_penalty NUMERIC := 0;
  v_defect_severities jsonb;
  v_defect_key TEXT;
  v_defect_severity TEXT;

  -- Age factor
  v_year_built INTEGER;
  v_building_age INTEGER;
  v_age_adjustment NUMERIC := 0;

  -- Green features
  v_green_features jsonb;
  v_green_bonus NUMERIC := 0;
  v_green_feature TEXT;

  -- Final calculation
  v_base_score NUMERIC := 0;
  v_final_score NUMERIC := 0;
  v_grade_letter TEXT;

BEGIN
  -- SECURITY: ensure caller owns the inspection (or is admin) even though this function is SECURITY DEFINER
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT inspector_id INTO v_inspector_id
  FROM public.inspections
  WHERE id = _inspection_id;

  IF v_inspector_id IS NULL THEN
    RAISE EXCEPTION 'Inspection not found';
  END IF;

  IF v_inspector_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Count overall ratings from checklist_items
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

  v_total_items_rated := v_excellent_count + v_very_good_count + v_good_count + v_poor_count + v_replace_count;

  -- If no items rated, return F
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
      category_scores = '{}'::jsonb,
      grade_calculated_at = NOW()
    WHERE id = _inspection_id;

    RETURN QUERY SELECT 0::NUMERIC, 'F'::TEXT;
    RETURN;
  END IF;

  -- Calculate weighted category scores
  FOR v_category_data IN 
    SELECT 
      category,
      SUM(CASE rating
        WHEN 'Excellent' THEN 100
        WHEN 'Very Good' THEN 87.5
        WHEN 'Good' THEN 75
        WHEN 'Poor' THEN 42.5
        WHEN 'Replace' THEN 0
        WHEN 'Partial Inspected' THEN 37.5  -- 50% of Good (75)
        ELSE NULL
      END) as total_points,
      COUNT(*) FILTER (WHERE rating IN ('Excellent', 'Very Good', 'Good', 'Poor', 'Replace')) as full_count,
      COUNT(*) FILTER (WHERE rating = 'Partial Inspected') as partial_count
    FROM public.checklist_items
    WHERE inspection_id = _inspection_id
      AND rating IS NOT NULL
      AND rating != 'Not Inspected'
    GROUP BY category
  LOOP
    -- Get weight for this category (default to 0.05 if not found)
    v_category_weight := COALESCE((v_category_weights->>v_category_data.category)::NUMERIC, 0.05);

    -- Calculate category score (full items count as 1, partial as 0.5)
    v_category_max_points := (v_category_data.full_count * 100) + (v_category_data.partial_count * 50);

    IF v_category_max_points > 0 THEN
      v_category_score := (v_category_data.total_points / v_category_max_points) * 100;
    ELSE
      v_category_score := 0;
    END IF;

    -- Calculate category grade from score
    IF v_category_score >= 95 THEN
      v_category_grade := 'A+';
    ELSIF v_category_score >= 90 THEN
      v_category_grade := 'A';
    ELSIF v_category_score >= 85 THEN
      v_category_grade := 'A-';
    ELSIF v_category_score >= 80 THEN
      v_category_grade := 'B+';
    ELSIF v_category_score >= 75 THEN
      v_category_grade := 'B';
    ELSIF v_category_score >= 70 THEN
      v_category_grade := 'B-';
    ELSIF v_category_score >= 65 THEN
      v_category_grade := 'C+';
    ELSIF v_category_score >= 60 THEN
      v_category_grade := 'C';
    ELSIF v_category_score >= 55 THEN
      v_category_grade := 'C-';
    ELSIF v_category_score >= 45 THEN
      v_category_grade := 'D';
    ELSE
      v_category_grade := 'F';
    END IF;

    -- Add to weighted total
    v_weighted_total := v_weighted_total + (v_category_weight * v_category_score);
    v_total_weight_used := v_total_weight_used + v_category_weight;

    -- Store category score with grade
    v_category_scores := v_category_scores || jsonb_build_object(
      v_category_data.category, 
      jsonb_build_object(
        'score', ROUND(v_category_score, 2),
        'grade', v_category_grade,
        'weight', v_category_weight,
        'weighted_score', ROUND(v_category_weight * v_category_score, 2),
        'items_rated', v_category_data.full_count + v_category_data.partial_count
      )
    );
  END LOOP;

  -- Normalize weighted total if weights don't sum to 1
  IF v_total_weight_used > 0 THEN
    v_base_score := v_weighted_total / v_total_weight_used;
  ELSE
    v_base_score := 0;
  END IF;

  -- Get defect severities and calculate penalty
  SELECT defect_severities INTO v_defect_severities
  FROM public.inspections
  WHERE id = _inspection_id;

  IF v_defect_severities IS NOT NULL AND v_defect_severities != '{}'::jsonb THEN
    FOR v_defect_key IN SELECT jsonb_object_keys(v_defect_severities)
    LOOP
      v_defect_severity := v_defect_severities->>v_defect_key;

      CASE v_defect_severity
        WHEN 'critical' THEN v_defect_penalty := v_defect_penalty + 20;
        WHEN 'major' THEN v_defect_penalty := v_defect_penalty + 12;
        WHEN 'moderate' THEN v_defect_penalty := v_defect_penalty + 5;
        WHEN 'minor' THEN v_defect_penalty := v_defect_penalty + 2;
        ELSE NULL;
      END CASE;
    END LOOP;
  END IF;

  -- Get building age and calculate age adjustment
  SELECT p.year_built INTO v_year_built
  FROM public.inspections i
  JOIN public.properties p ON i.property_id = p.id
  WHERE i.id = _inspection_id;

  IF v_year_built IS NOT NULL THEN
    v_building_age := EXTRACT(YEAR FROM CURRENT_DATE) - v_year_built;

    IF v_building_age < 5 THEN
      v_age_adjustment := 3;
    ELSIF v_building_age <= 15 THEN
      v_age_adjustment := 0;
    ELSIF v_building_age <= 30 THEN
      v_age_adjustment := -2;
    ELSIF v_building_age <= 50 THEN
      v_age_adjustment := -5;
    ELSE
      v_age_adjustment := -8;
    END IF;
  END IF;

  -- Get green features and calculate bonus
  SELECT green_features INTO v_green_features
  FROM public.inspections
  WHERE id = _inspection_id;

  IF v_green_features IS NOT NULL AND jsonb_array_length(v_green_features) > 0 THEN
    FOR v_green_feature IN SELECT jsonb_array_elements_text(v_green_features)
    LOOP
      CASE LOWER(v_green_feature)
        WHEN 'solar_panels' THEN v_green_bonus := v_green_bonus + 2;
        WHEN 'solar panels' THEN v_green_bonus := v_green_bonus + 2;
        WHEN 'energy_efficient_windows' THEN v_green_bonus := v_green_bonus + 1;
        WHEN 'energy efficient windows' THEN v_green_bonus := v_green_bonus + 1;
        WHEN 'high_efficiency_hvac' THEN v_green_bonus := v_green_bonus + 1;
        WHEN 'high efficiency hvac' THEN v_green_bonus := v_green_bonus + 1;
        WHEN 'water_conservation' THEN v_green_bonus := v_green_bonus + 1;
        WHEN 'water conservation' THEN v_green_bonus := v_green_bonus + 1;
        ELSE NULL;
      END CASE;
    END LOOP;

    -- Cap green bonus at 5%
    IF v_green_bonus > 5 THEN
      v_green_bonus := 5;
    END IF;
  END IF;

  -- Calculate final score
  v_final_score := v_base_score - v_defect_penalty + v_age_adjustment + v_green_bonus;

  -- Clamp to 0-100 range
  IF v_final_score < 0 THEN
    v_final_score := 0;
  ELSIF v_final_score > 100 THEN
    v_final_score := 100;
  END IF;

  -- Determine letter grade with +/- modifiers
  IF v_final_score >= 95 THEN
    v_grade_letter := 'A+';
  ELSIF v_final_score >= 90 THEN
    v_grade_letter := 'A';
  ELSIF v_final_score >= 85 THEN
    v_grade_letter := 'A-';
  ELSIF v_final_score >= 80 THEN
    v_grade_letter := 'B+';
  ELSIF v_final_score >= 75 THEN
    v_grade_letter := 'B';
  ELSIF v_final_score >= 70 THEN
    v_grade_letter := 'B-';
  ELSIF v_final_score >= 65 THEN
    v_grade_letter := 'C+';
  ELSIF v_final_score >= 60 THEN
    v_grade_letter := 'C';
  ELSIF v_final_score >= 55 THEN
    v_grade_letter := 'C-';
  ELSIF v_final_score >= 45 THEN
    v_grade_letter := 'D';
  ELSE
    v_grade_letter := 'F';
  END IF;

  -- Update inspection with all calculated values
  UPDATE public.inspections
  SET 
    total_items_rated = v_total_items_rated,
    total_points_earned = v_base_score,
    total_points_possible = 100,
    final_grade_numeric = v_final_score,
    final_grade_letter = v_grade_letter,
    excellent_count = v_excellent_count,
    very_good_count = v_very_good_count,
    good_count = v_good_count,
    poor_count = v_poor_count,
    replace_count = v_replace_count,
    not_inspected_count = v_not_inspected_count,
    partial_inspected_count = v_partial_inspected_count,
    category_scores = v_category_scores,
    grade_calculated_at = NOW()
  WHERE id = _inspection_id;

  RETURN QUERY SELECT v_final_score, v_grade_letter;
END;
$function$;