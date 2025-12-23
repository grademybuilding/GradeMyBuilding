-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Inspectors can upload photos" ON storage.objects;

-- Create a new policy that allows uploading photos to inspection folders
-- The user must be authenticated and own the inspection (via inspector_id)
CREATE POLICY "Inspectors can upload photos to their inspections"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'inspection-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.inspections WHERE inspector_id = auth.uid()
  )
);

-- Also add UPDATE and DELETE policies for managing photos
DROP POLICY IF EXISTS "Inspectors can update their photos" ON storage.objects;
CREATE POLICY "Inspectors can update their photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'inspection-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.inspections WHERE inspector_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Inspectors can delete their photos" ON storage.objects;
CREATE POLICY "Inspectors can delete their photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'inspection-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.inspections WHERE inspector_id = auth.uid()
  )
);