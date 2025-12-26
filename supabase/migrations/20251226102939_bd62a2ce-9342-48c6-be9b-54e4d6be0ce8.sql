-- Update the calculate_category_grades function to include Swimming Pools and Spas category
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
  v_category_total_points NUMERIC;
  v_category_max_points NUMERIC;
  v_category_score NUMERIC;
  v_category_grade TEXT;
  v_main_category TEXT;
  
  -- Define the main categories (now including Swimming Pools and Spas)
  v_main_categories TEXT[] := ARRAY[
    'Roof',
    'Exterior Cladding', 
    'Walkways/Patios/Driveways',
    'Wood Decks & Balconies',
    'Foundation & Structure',
    'Plumbing',
    'Electrical',
    'Heating & Cooling',
    'Doors & Windows',
    'Built-in Appliances',
    'Green Features',
    'Radon',
    'Well',
    'Swimming Pools and Spas'
  ];
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

  -- Calculate grades for each main category
  -- Map subcategories/variations to their main category
  FOR v_category_data IN 
    SELECT 
      CASE 
        -- Roof category
        WHEN category ILIKE '%roof%' OR subcategory ILIKE '%roof%' THEN 'Roof'
        -- Exterior Cladding
        WHEN category ILIKE '%exterior%' OR category ILIKE '%siding%' OR category ILIKE '%cladding%' 
          OR subcategory ILIKE '%exterior%' OR subcategory ILIKE '%siding%' THEN 'Exterior Cladding'
        -- Walkways/Patios/Driveways
        WHEN category ILIKE '%walkway%' OR category ILIKE '%patio%' OR category ILIKE '%driveway%'
          OR subcategory ILIKE '%walkway%' OR subcategory ILIKE '%patio%' THEN 'Walkways/Patios/Driveways'
        -- Wood Decks & Balconies
        WHEN category ILIKE '%deck%' OR category ILIKE '%balcon%'
          OR subcategory ILIKE '%deck%' OR subcategory ILIKE '%balcon%' THEN 'Wood Decks & Balconies'
        -- Foundation & Structure
        WHEN category ILIKE '%foundation%' OR category ILIKE '%structure%' OR category ILIKE '%basement%'
          OR category ILIKE '%crawl%' OR category ILIKE '%attic%'
          OR subcategory ILIKE '%foundation%' OR subcategory ILIKE '%structure%' THEN 'Foundation & Structure'
        -- Plumbing
        WHEN category ILIKE '%plumb%' OR category ILIKE '%water heater%' OR category ILIKE '%pipe%'
          OR subcategory ILIKE '%plumb%' THEN 'Plumbing'
        -- Electrical
        WHEN category ILIKE '%electr%' OR category ILIKE '%wiring%' OR category ILIKE '%panel%'
          OR subcategory ILIKE '%electr%' THEN 'Electrical'
        -- Heating & Cooling
        WHEN category ILIKE '%heat%' OR category ILIKE '%cool%' OR category ILIKE '%hvac%'
          OR category ILIKE '%furnace%' OR category ILIKE '%air condition%'
          OR subcategory ILIKE '%heat%' OR subcategory ILIKE '%cool%' THEN 'Heating & Cooling'
        -- Doors & Windows
        WHEN category ILIKE '%door%' OR category ILIKE '%window%' OR category ILIKE '%entry%'
          OR category ILIKE '%garage door%'
          OR subcategory ILIKE '%door%' OR subcategory ILIKE '%window%' THEN 'Doors & Windows'
        -- Built-in Appliances
        WHEN category ILIKE '%appliance%' OR category ILIKE '%dishwasher%' OR category ILIKE '%disposal%'
          OR category ILIKE '%refrigerator%' OR category ILIKE '%oven%' OR category ILIKE '%range%'
          OR category ILIKE '%exhaust%' OR category ILIKE '%vent%'
          OR subcategory ILIKE '%appliance%' THEN 'Built-in Appliances'
        -- Green Features
        WHEN category ILIKE '%green%' OR category ILIKE '%solar%' OR category ILIKE '%energy%'
          OR subcategory ILIKE '%green%' THEN 'Green Features'
        -- Radon
        WHEN category ILIKE '%radon%' OR subcategory ILIKE '%radon%' THEN 'Radon'
        -- Well
        WHEN category ILIKE '%well%' OR subcategory ILIKE '%well%' THEN 'Well'
        -- Swimming Pools and Spas
        WHEN category ILIKE '%pool%' OR category ILIKE '%spa%' OR category ILIKE '%swim%'
          OR subcategory ILIKE '%pool%' OR subcategory ILIKE '%spa%' THEN 'Swimming Pools and Spas'
        -- Default to the category name if no match
        ELSE category
      END as main_category,
      SUM(CASE rating
        WHEN 'Excellent' THEN 100
        WHEN 'Very Good' THEN 87.5
        WHEN 'Good' THEN 75
        WHEN 'Poor' THEN 42.5
        WHEN 'Replace' THEN 0
        WHEN 'Partial Inspected' THEN 37.5
        ELSE NULL
      END) as total_points,
      COUNT(*) FILTER (WHERE rating IN ('Excellent', 'Very Good', 'Good', 'Poor', 'Replace')) as full_count,
      COUNT(*) FILTER (WHERE rating = 'Partial Inspected') as partial_count
    FROM public.checklist_items
    WHERE inspection_id = _inspection_id
      AND category IS NOT NULL
      AND rating IS NOT NULL
      AND rating != 'Not Inspected'
    GROUP BY 1
  LOOP
    -- Calculate category max points (full items * 100 + partial items * 50)
    v_category_max_points := (v_category_data.full_count * 100) + (v_category_data.partial_count * 50);
    
    IF v_category_max_points > 0 THEN
      v_category_score := (v_category_data.total_points / v_category_max_points) * 100;
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

    -- Add category with its grade to result
    v_category_grades := v_category_grades || jsonb_build_object(
      v_category_data.main_category,
      jsonb_build_object(
        'score', ROUND(v_category_score, 2),
        'grade', v_category_grade
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