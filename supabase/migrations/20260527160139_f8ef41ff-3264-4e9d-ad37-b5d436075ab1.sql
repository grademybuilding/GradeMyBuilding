
DROP POLICY IF EXISTS "Users can view inspection photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own inspection photos" ON storage.objects;

CREATE POLICY "Inspection photos viewable by owner or assignee"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'inspection-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT i.id::text FROM public.inspections i
    WHERE i.inspector_id = auth.uid()
    UNION
    SELECT a.inspection_id::text FROM public.inspection_assignments a
    WHERE a.assigned_to = auth.uid()
  )
);
