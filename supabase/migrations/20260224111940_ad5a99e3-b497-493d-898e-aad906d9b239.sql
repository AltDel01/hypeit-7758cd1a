
-- Remove the public read policy on product-images bucket
DROP POLICY IF EXISTS "Public can view Product Images" ON storage.objects;

-- Ensure owner-scoped SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can view own files in product-images'
  ) THEN
    CREATE POLICY "Users can view own files in product-images"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'product-images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Service role access for backend operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Service role full access to product-images'
  ) THEN
    CREATE POLICY "Service role full access to product-images"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;
