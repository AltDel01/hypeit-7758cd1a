
CREATE POLICY "Authenticated users can upload to generated-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated-images');

CREATE POLICY "Service role can upload to generated-images"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'generated-images');
