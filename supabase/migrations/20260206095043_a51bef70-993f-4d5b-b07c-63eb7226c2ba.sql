-- Create policies for the Product Images bucket (bucket already exists)
CREATE POLICY "Authenticated users can upload to Product Images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Product Images');

CREATE POLICY "Authenticated users can view their own files in Product Images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'Product Images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view Product Images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Product Images');

CREATE POLICY "Users can update their own files in Product Images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'Product Images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files in Product Images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'Product Images' AND auth.uid()::text = (storage.foldername(name))[1]);