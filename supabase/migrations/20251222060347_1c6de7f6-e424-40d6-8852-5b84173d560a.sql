-- Drop the problematic policies
DROP POLICY IF EXISTS "Inspectors can view assigned properties" ON public.properties;
DROP POLICY IF EXISTS "Property owners can view inspections" ON public.inspections;
DROP POLICY IF EXISTS "Property owners can view checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Property owners can view photos" ON public.inspection_photos;
DROP POLICY IF EXISTS "Property owners can view valuations" ON public.valuations;

-- Create security definer function to check if user owns a property (bypasses RLS)
CREATE OR REPLACE FUNCTION public.user_owns_property(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = _property_id AND created_by = _user_id
  )
$$;

-- Create security definer function to check if inspector has an inspection for a property
CREATE OR REPLACE FUNCTION public.inspector_has_property_access(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.inspections
    WHERE property_id = _property_id AND inspector_id = _user_id
  )
$$;

-- Create security definer function to check if user owns an inspection's property
CREATE OR REPLACE FUNCTION public.user_owns_inspection_property(_user_id uuid, _inspection_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.inspections i
    JOIN public.properties p ON i.property_id = p.id
    WHERE i.id = _inspection_id AND p.created_by = _user_id
  )
$$;

-- Re-create the policies using security definer functions

-- Properties: Inspectors can view properties they have inspections for
CREATE POLICY "Inspectors can view assigned properties" 
ON public.properties 
FOR SELECT 
USING (
  has_role(auth.uid(), 'inspector'::app_role) 
  AND public.inspector_has_property_access(auth.uid(), id)
);

-- Inspections: Property owners can view inspections on their properties
CREATE POLICY "Property owners can view inspections" 
ON public.inspections 
FOR SELECT 
USING (public.user_owns_property(auth.uid(), property_id));

-- Checklist items: Property owners can view checklist items
CREATE POLICY "Property owners can view checklist items" 
ON public.checklist_items 
FOR SELECT 
USING (public.user_owns_inspection_property(auth.uid(), inspection_id));

-- Photos: Property owners can view photos
CREATE POLICY "Property owners can view photos" 
ON public.inspection_photos 
FOR SELECT 
USING (public.user_owns_inspection_property(auth.uid(), inspection_id));

-- Valuations: Property owners can view valuations (already uses property_id directly)
CREATE POLICY "Property owners can view valuations" 
ON public.valuations 
FOR SELECT 
USING (public.user_owns_property(auth.uid(), property_id));