
CREATE POLICY "Authenticated users can update generated-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'generated-images')
WITH CHECK (bucket_id = 'generated-images');

CREATE POLICY "Service role can update generated-images"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'generated-images')
WITH CHECK (bucket_id = 'generated-images');
