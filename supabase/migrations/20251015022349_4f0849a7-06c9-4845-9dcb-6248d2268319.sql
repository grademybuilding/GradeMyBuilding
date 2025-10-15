-- Create checklist_items table for normalized checklist storage
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('checkbox', 'rating', 'year', 'multiselect', 'gallons')),
  selected_values JSONB DEFAULT '[]'::JSONB,
  rating TEXT CHECK (rating IN ('Excellent', 'Very Good', 'Good', 'Poor', 'Replace', 'Not Inspected', 'Partial Inspected')),
  notes TEXT,
  defect_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table for normalized photo storage
CREATE TABLE IF NOT EXISTS public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES public.checklist_items(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_checklist_items_inspection ON public.checklist_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON public.checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection ON public.inspection_photos(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_checklist_item ON public.inspection_photos(checklist_item_id);

-- Enable RLS on new tables
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_items
CREATE POLICY "Inspectors can manage own checklist items"
ON public.checklist_items
FOR ALL
USING (
  inspection_id IN (
    SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all checklist items"
ON public.checklist_items
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can view checklist items"
ON public.checklist_items
FOR SELECT
USING (
  inspection_id IN (
    SELECT inspection_id FROM public.inspection_assignments 
    WHERE assigned_to = auth.uid()
  )
);

CREATE POLICY "Property owners can view checklist items"
ON public.checklist_items
FOR SELECT
USING (
  inspection_id IN (
    SELECT i.id FROM public.inspections i
    JOIN public.properties p ON i.property_id = p.id
    WHERE p.created_by = auth.uid()
  )
);

-- RLS Policies for inspection_photos
CREATE POLICY "Inspectors can manage own photos"
ON public.inspection_photos
FOR ALL
USING (
  inspection_id IN (
    SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all photos"
ON public.inspection_photos
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can view photos"
ON public.inspection_photos
FOR SELECT
USING (
  inspection_id IN (
    SELECT inspection_id FROM public.inspection_assignments 
    WHERE assigned_to = auth.uid()
  )
);

CREATE POLICY "Property owners can view photos"
ON public.inspection_photos
FOR SELECT
USING (
  inspection_id IN (
    SELECT i.id FROM public.inspections i
    JOIN public.properties p ON i.property_id = p.id
    WHERE p.created_by = auth.uid()
  )
);

-- Update trigger for checklist_items
CREATE TRIGGER update_checklist_items_updated_at
BEFORE UPDATE ON public.checklist_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to migrate existing JSONB data to new tables (optional, for data migration)
CREATE OR REPLACE FUNCTION public.migrate_checklist_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be used to migrate existing JSONB checklist data
  -- to the new normalized tables if needed
  RAISE NOTICE 'Checklist migration function created. Run manually if needed.';
END;
$$;

-- Create function to calculate grade from checklist_items table
CREATE OR REPLACE FUNCTION public.calculate_inspection_grade_v2(_inspection_id UUID)
RETURNS TABLE(grade_numeric NUMERIC, grade_letter TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  v_total_points_possible INTEGER := 0;
  v_percentage NUMERIC := 0;
  v_grade_letter TEXT;
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

  -- Points: Excellent=5, Very Good=4, Good=3, Poor=1, Replace=0
  v_total_points_earned := (v_excellent_count * 5) + (v_very_good_count * 4) + (v_good_count * 3) + (v_poor_count * 1);
  v_total_points_possible := v_total_items_rated * 5;
  v_percentage := (v_total_points_earned::NUMERIC / v_total_points_possible::NUMERIC) * 100;

  -- Grade mapping
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
$$;