
CREATE POLICY "Admins can view product-images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Editors can view product-images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'editor'::public.app_role));
