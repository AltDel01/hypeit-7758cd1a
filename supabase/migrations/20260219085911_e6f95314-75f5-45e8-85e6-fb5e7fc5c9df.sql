
-- Allow authenticated users to delete from generated-images (needed for overwrite/replace operations)
CREATE POLICY "Authenticated users can delete from generated-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'generated-images');

-- Allow service role full delete access
CREATE POLICY "Service role can delete from generated-images"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'generated-images');

-- Also allow anon role to insert (Supabase dashboard sometimes uses anon key)
CREATE POLICY "Anon users can upload to generated-images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'generated-images');

-- And anon update
CREATE POLICY "Anon users can update generated-images"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'generated-images')
WITH CHECK (bucket_id = 'generated-images');
