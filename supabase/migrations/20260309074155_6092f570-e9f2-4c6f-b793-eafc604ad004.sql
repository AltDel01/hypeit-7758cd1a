-- Allow editors to upload results to generated-images bucket
CREATE POLICY "Editors can upload to generated-images results"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = 'results'
  AND public.has_role(auth.uid(), 'editor')
);

-- Allow editors to read from generated-images results
CREATE POLICY "Editors can view generated-images results"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = 'results'
  AND public.has_role(auth.uid(), 'editor')
);

-- Also allow admins
CREATE POLICY "Admins can upload to generated-images results"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = 'results'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view generated-images results"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = 'results'
  AND public.has_role(auth.uid(), 'admin')
);