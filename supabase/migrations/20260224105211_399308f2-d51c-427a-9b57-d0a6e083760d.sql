
-- Drop overly permissive policies on generated-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload to generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Anon users can upload to generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Anon users can update generated-images" ON storage.objects;

-- Add owner-scoped policies
CREATE POLICY "Users can upload own files to generated-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own files in generated-images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own files in generated-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files in generated-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Keep service role access for backend operations
CREATE POLICY "Service role full access to generated-images"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'generated-images')
WITH CHECK (bucket_id = 'generated-images');
