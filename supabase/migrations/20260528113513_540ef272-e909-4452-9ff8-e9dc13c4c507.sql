CREATE POLICY "Admins can view all generated result files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Request owners can view linked generated result files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND EXISTS (
    SELECT 1
    FROM public.generation_requests gr
    WHERE gr.user_id = auth.uid()
      AND gr.result_url = ('storage:generated-images/' || storage.objects.name)
  )
);