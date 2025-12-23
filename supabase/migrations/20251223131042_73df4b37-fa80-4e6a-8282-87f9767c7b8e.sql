-- Make the inspection-photos bucket public so images can be viewed
UPDATE storage.buckets SET public = true WHERE id = 'inspection-photos';