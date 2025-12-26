-- Create a function to recalculate grades for all inspections
-- This function can be called by admins to update all existing inspection grades
CREATE OR REPLACE FUNCTION public.recalculate_all_inspection_grades()
RETURNS TABLE(inspection_id uuid, old_grade text, new_grade text, category_count int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inspection RECORD;
  v_old_grade TEXT;
  v_new_category_scores JSONB;
  v_category_count INT;
BEGIN
  -- Loop through all inspections with checklist data
  FOR v_inspection IN 
    SELECT id, final_grade_letter 
    FROM public.inspections 
    WHERE checklist_ratings IS NOT NULL 
      AND checklist_ratings != '{}'::jsonb
  LOOP
    v_old_grade := v_inspection.final_grade_letter;
    
    -- Call the category grades function for this inspection
    BEGIN
      -- Use direct SQL to bypass auth check for bulk update
      SELECT public.calculate_category_grades_admin(v_inspection.id) INTO v_new_category_scores;
      
      -- Count categories in result
      SELECT COUNT(*) INTO v_category_count
      FROM jsonb_object_keys(v_new_category_scores);
      
      -- Return result row
      inspection_id := v_inspection.id;
      old_grade := v_old_grade;
      new_grade := (SELECT i.final_grade_letter FROM public.inspections i WHERE i.id = v_inspection.id);
      category_count := v_category_count;
      RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
      -- Log error and continue
      inspection_id := v_inspection.id;
      old_grade := v_old_grade;
      new_grade := 'ERROR';
      category_count := 0;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- Create admin version of calculate_category_grades that bypasses auth
CREATE OR REPLACE FUNCTION public.calculate_category_grades_admin(_inspection_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_category_grades jsonb := '{}'::jsonb;
  v_category_data RECORD;
  v_category_total_points NUMERIC;
  v_category_max_points NUMERIC;
  v_category_score NUMERIC;
  v_category_grade TEXT;
  v_checklist_ratings JSONB;
  v_item_key TEXT;
  v_rating TEXT;
  v_main_category TEXT;
  v_category_points RECORD;
  
  -- Temporary table to accumulate category scores
  v_temp_scores jsonb := '{}'::jsonb;
BEGIN
  -- Get checklist_ratings from inspection
  SELECT checklist_ratings INTO v_checklist_ratings
  FROM public.inspections
  WHERE id = _inspection_id;

  IF v_checklist_ratings IS NULL OR v_checklist_ratings = '{}'::jsonb THEN
    RETURN '{}'::jsonb;
  END IF;

  -- Process each rating and map to main category
  FOR v_item_key IN SELECT jsonb_object_keys(v_checklist_ratings)
  LOOP
    v_rating := v_checklist_ratings->>v_item_key;
    
    -- Skip non-graded ratings
    IF v_rating IS NULL OR v_rating = 'Not Inspected' THEN
      CONTINUE;
    END IF;
    
    -- Map item key to main category based on prefix
    v_main_category := CASE
      -- Roof category
      WHEN v_item_key ILIKE 'roof%' THEN 'Roof'
      -- Exterior Cladding
      WHEN v_item_key ILIKE 'exterior%' OR v_item_key ILIKE 'siding%' THEN 'Exterior Cladding'
      -- Walkways/Patios/Driveways
      WHEN v_item_key ILIKE 'walkway%' OR v_item_key ILIKE 'patio%' OR v_item_key ILIKE 'driveway%' THEN 'Walkways/Patios/Driveways'
      -- Wood Decks & Balconies
      WHEN v_item_key ILIKE 'deck%' OR v_item_key ILIKE 'wood-deck%' OR v_item_key ILIKE 'balcon%' THEN 'Wood Decks & Balconies'
      -- Foundation & Structure
      WHEN v_item_key ILIKE 'foundation%' OR v_item_key ILIKE 'structure%' OR v_item_key ILIKE 'basement%'
        OR v_item_key ILIKE 'crawl%' OR v_item_key ILIKE 'attic%' OR v_item_key ILIKE 'floor-struct%'
        OR v_item_key ILIKE 'wall-struct%' OR v_item_key ILIKE 'ceiling-struct%' THEN 'Foundation & Structure'
      -- Plumbing
      WHEN v_item_key ILIKE 'plumb%' OR v_item_key ILIKE 'water-heater%' OR v_item_key ILIKE 'water-supply%'
        OR v_item_key ILIKE 'drain%' OR v_item_key ILIKE 'fixture%' THEN 'Plumbing'
      -- Electrical
      WHEN v_item_key ILIKE 'electr%' OR v_item_key ILIKE 'wiring%' OR v_item_key ILIKE 'panel%'
        OR v_item_key ILIKE 'service-entrance%' OR v_item_key ILIKE 'branch-circuit%'
        OR v_item_key ILIKE 'connected-device%' THEN 'Electrical'
      -- Heating & Cooling
      WHEN v_item_key ILIKE 'heat%' OR v_item_key ILIKE 'cool%' OR v_item_key ILIKE 'hvac%'
        OR v_item_key ILIKE 'furnace%' OR v_item_key ILIKE 'air-condition%'
        OR v_item_key ILIKE 'distribution%' OR v_item_key ILIKE 'operating-control%'
        OR v_item_key ILIKE 'vent%' OR v_item_key ILIKE 'flue%' THEN 'Heating & Cooling'
      -- Doors & Windows
      WHEN v_item_key ILIKE 'door%' OR v_item_key ILIKE 'window%' OR v_item_key ILIKE 'entry%'
        OR v_item_key ILIKE 'garage-door%' OR v_item_key ILIKE 'interior-door%' THEN 'Doors & Windows'
      -- Built-in Appliances
      WHEN v_item_key ILIKE 'appliance%' OR v_item_key ILIKE 'dishwasher%' OR v_item_key ILIKE 'disposal%'
        OR v_item_key ILIKE 'refrigerator%' OR v_item_key ILIKE 'oven%' OR v_item_key ILIKE 'range%'
        OR v_item_key ILIKE 'exhaust%' OR v_item_key ILIKE 'microwave%' OR v_item_key ILIKE 'cooktop%'
        OR v_item_key ILIKE 'cooking%' THEN 'Built-in Appliances'
      -- Green Features
      WHEN v_item_key ILIKE 'green%' OR v_item_key ILIKE 'solar%' OR v_item_key ILIKE 'energy%' THEN 'Green Features'
      -- Radon
      WHEN v_item_key ILIKE 'radon%' THEN 'Radon'
      -- Well
      WHEN v_item_key ILIKE 'well%' THEN 'Well'
      -- Default: try to extract from key
      ELSE 'Other'
    END;

    -- Calculate points for this rating
    DECLARE
      v_points NUMERIC;
      v_max_points NUMERIC := 100;
      v_weight NUMERIC := 1;
    BEGIN
      v_points := CASE v_rating
        WHEN 'Excellent' THEN 100
        WHEN 'Very Good' THEN 87.5
        WHEN 'Good' THEN 75
        WHEN 'Poor' THEN 42.5
        WHEN 'Replace' THEN 0
        WHEN 'Partial Inspected' THEN 37.5
        ELSE NULL
      END;

      IF v_points IS NOT NULL THEN
        -- Partial inspected counts as 0.5 weight
        IF v_rating = 'Partial Inspected' THEN
          v_weight := 0.5;
        END IF;

        -- Add to category accumulator
        IF v_temp_scores ? v_main_category THEN
          v_temp_scores := jsonb_set(
            v_temp_scores,
            ARRAY[v_main_category],
            jsonb_build_object(
              'total_points', (v_temp_scores->v_main_category->>'total_points')::numeric + v_points,
              'max_points', (v_temp_scores->v_main_category->>'max_points')::numeric + (v_max_points * v_weight),
              'count', (v_temp_scores->v_main_category->>'count')::int + 1
            )
          );
        ELSE
          v_temp_scores := v_temp_scores || jsonb_build_object(
            v_main_category,
            jsonb_build_object(
              'total_points', v_points,
              'max_points', v_max_points * v_weight,
              'count', 1
            )
          );
        END IF;
      END IF;
    END;
  END LOOP;

  -- Convert accumulated scores to final grades
  FOR v_main_category IN SELECT jsonb_object_keys(v_temp_scores)
  LOOP
    v_category_total_points := (v_temp_scores->v_main_category->>'total_points')::numeric;
    v_category_max_points := (v_temp_scores->v_main_category->>'max_points')::numeric;

    IF v_category_max_points > 0 THEN
      v_category_score := (v_category_total_points / v_category_max_points) * 100;
    ELSE
      v_category_score := 0;
    END IF;

    -- Convert score to letter grade
    v_category_grade := CASE
      WHEN v_category_score >= 95 THEN 'A+'
      WHEN v_category_score >= 90 THEN 'A'
      WHEN v_category_score >= 85 THEN 'A-'
      WHEN v_category_score >= 80 THEN 'B+'
      WHEN v_category_score >= 75 THEN 'B'
      WHEN v_category_score >= 70 THEN 'B-'
      WHEN v_category_score >= 65 THEN 'C+'
      WHEN v_category_score >= 60 THEN 'C'
      WHEN v_category_score >= 55 THEN 'C-'
      WHEN v_category_score >= 45 THEN 'D'
      ELSE 'F'
    END;

    v_category_grades := v_category_grades || jsonb_build_object(
      v_main_category,
      jsonb_build_object(
        'score', ROUND(v_category_score, 2),
        'grade', v_category_grade
      )
    );
  END LOOP;

  -- Update inspection with new category scores
  UPDATE public.inspections
  SET 
    category_scores = v_category_grades,
    updated_at = NOW()
  WHERE id = _inspection_id;

  RETURN v_category_grades;
END;
$$;

-- Now run the recalculation for all existing inspections
DO $$
DECLARE
  v_inspection RECORD;
  v_result JSONB;
BEGIN
  FOR v_inspection IN 
    SELECT id 
    FROM public.inspections 
    WHERE checklist_ratings IS NOT NULL 
      AND checklist_ratings != '{}'::jsonb
  LOOP
    BEGIN
      SELECT public.calculate_category_grades_admin(v_inspection.id) INTO v_result;
      RAISE NOTICE 'Updated inspection %: %', v_inspection.id, v_result;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error updating inspection %: %', v_inspection.id, SQLERRM;
    END;
  END LOOP;
END;
$$;