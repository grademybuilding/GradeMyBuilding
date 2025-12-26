-- Function to calculate grades for each category and store in inspections table
CREATE OR REPLACE FUNCTION public.calculate_category_grades(_inspection_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_inspector_id uuid;
  v_category_grades jsonb := '{}'::jsonb;
  v_category_data RECORD;
  v_subcategory_data RECORD;
  v_category_total_points NUMERIC;
  v_category_max_points NUMERIC;
  v_category_score NUMERIC;
  v_category_grade TEXT;
  v_subcategory_scores jsonb;
  v_subcategory_score NUMERIC;
  v_subcategory_grade TEXT;
  v_subcategory_total_points NUMERIC;
  v_subcategory_max_points NUMERIC;
BEGIN
  -- SECURITY: ensure caller owns the inspection (or is admin)
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

  -- Calculate grades for each category
  FOR v_category_data IN 
    SELECT DISTINCT category
    FROM public.checklist_items
    WHERE inspection_id = _inspection_id
      AND category IS NOT NULL
  LOOP
    -- Initialize subcategory scores for this category
    v_subcategory_scores := '{}'::jsonb;
    v_category_total_points := 0;
    v_category_max_points := 0;

    -- Calculate scores for each subcategory within the category
    FOR v_subcategory_data IN
      SELECT 
        subcategory,
        SUM(CASE rating
          WHEN 'Excellent' THEN 100
          WHEN 'Very Good' THEN 87.5
          WHEN 'Good' THEN 75
          WHEN 'Poor' THEN 42.5
          WHEN 'Replace' THEN 0
          WHEN 'Partial Inspected' THEN 37.5  -- 50% of Good (75 * 0.5)
          ELSE NULL
        END) as total_points,
        -- Full items count as 100 max points each
        COUNT(*) FILTER (WHERE rating IN ('Excellent', 'Very Good', 'Good', 'Poor', 'Replace')) as full_count,
        -- Partial items count as 50 max points each (50% weight)
        COUNT(*) FILTER (WHERE rating = 'Partial Inspected') as partial_count
      FROM public.checklist_items
      WHERE inspection_id = _inspection_id
        AND category = v_category_data.category
        AND rating IS NOT NULL
        AND rating != 'Not Inspected'
      GROUP BY subcategory
    LOOP
      -- Calculate subcategory max points (full items * 100 + partial items * 50)
      v_subcategory_max_points := (v_subcategory_data.full_count * 100) + (v_subcategory_data.partial_count * 50);
      
      IF v_subcategory_max_points > 0 THEN
        v_subcategory_score := (v_subcategory_data.total_points / v_subcategory_max_points) * 100;
      ELSE
        v_subcategory_score := NULL;
      END IF;

      -- Convert subcategory score to letter grade
      IF v_subcategory_score IS NOT NULL THEN
        IF v_subcategory_score >= 95 THEN
          v_subcategory_grade := 'A+';
        ELSIF v_subcategory_score >= 90 THEN
          v_subcategory_grade := 'A';
        ELSIF v_subcategory_score >= 85 THEN
          v_subcategory_grade := 'A-';
        ELSIF v_subcategory_score >= 80 THEN
          v_subcategory_grade := 'B+';
        ELSIF v_subcategory_score >= 75 THEN
          v_subcategory_grade := 'B';
        ELSIF v_subcategory_score >= 70 THEN
          v_subcategory_grade := 'B-';
        ELSIF v_subcategory_score >= 65 THEN
          v_subcategory_grade := 'C+';
        ELSIF v_subcategory_score >= 60 THEN
          v_subcategory_grade := 'C';
        ELSIF v_subcategory_score >= 55 THEN
          v_subcategory_grade := 'C-';
        ELSIF v_subcategory_score >= 45 THEN
          v_subcategory_grade := 'D';
        ELSE
          v_subcategory_grade := 'F';
        END IF;

        -- Add subcategory to scores
        IF v_subcategory_data.subcategory IS NOT NULL THEN
          v_subcategory_scores := v_subcategory_scores || jsonb_build_object(
            v_subcategory_data.subcategory,
            jsonb_build_object(
              'score', ROUND(v_subcategory_score, 2),
              'grade', v_subcategory_grade,
              'items_rated', v_subcategory_data.full_count + v_subcategory_data.partial_count
            )
          );
        END IF;

        -- Accumulate for category total
        v_category_total_points := v_category_total_points + v_subcategory_data.total_points;
        v_category_max_points := v_category_max_points + v_subcategory_max_points;
      END IF;
    END LOOP;

    -- Calculate overall category score
    IF v_category_max_points > 0 THEN
      v_category_score := (v_category_total_points / v_category_max_points) * 100;
    ELSE
      v_category_score := 0;
    END IF;

    -- Convert category score to letter grade
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

    -- Add category with its grade and subcategories to result
    v_category_grades := v_category_grades || jsonb_build_object(
      v_category_data.category,
      jsonb_build_object(
        'score', ROUND(v_category_score, 2),
        'grade', v_category_grade,
        'subcategories', v_subcategory_scores
      )
    );
  END LOOP;

  -- Update the inspections table with category grades
  UPDATE public.inspections
  SET 
    category_scores = v_category_grades,
    updated_at = NOW()
  WHERE id = _inspection_id;

  RETURN v_category_grades;
END;
$function$;