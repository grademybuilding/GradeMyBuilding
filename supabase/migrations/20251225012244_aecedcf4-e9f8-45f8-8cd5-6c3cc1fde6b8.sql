-- Make the inspection-photos bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'inspection-photos';

-- Drop existing SELECT policy if any and create a proper one
-- Users can only view photos from their own inspections
DROP POLICY IF EXISTS "Authenticated users can view all inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own inspection photos" ON storage.objects;

CREATE POLICY "Users can view their own inspection photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'inspection-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT i.id::text
    FROM public.inspections i
    WHERE i.inspector_id = auth.uid()
  )
);