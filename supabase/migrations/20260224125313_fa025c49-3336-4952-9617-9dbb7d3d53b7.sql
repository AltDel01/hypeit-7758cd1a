
-- Remove stale policies referencing non-existent 'Product Images' bucket
DROP POLICY IF EXISTS "Authenticated users can upload to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view their own files in Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files in Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files in Product Images" ON storage.objects;

-- Remove overly broad public read policy that exposes product-images and generated-images
DROP POLICY IF EXISTS "Public read access for all buckets" ON storage.objects;

-- Re-create public read for avatars only (avatars are meant to be public)
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Make product-images bucket private (owner-scoped access via signed URLs)
UPDATE storage.buckets SET public = false WHERE id = 'product-images';

-- Make generated-images bucket private (owner-scoped access via signed URLs)
UPDATE storage.buckets SET public = false WHERE id = 'generated-images';
