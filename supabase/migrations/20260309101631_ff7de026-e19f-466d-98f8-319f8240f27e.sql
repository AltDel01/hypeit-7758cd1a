
CREATE POLICY "Users can view results for their own requests"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND (storage.foldername(name))[1] = 'results'
  AND EXISTS (
    SELECT 1 FROM public.generation_requests gr
    WHERE gr.user_id = auth.uid()
      AND gr.result_url LIKE '%' || storage.filename(name)
  )
);
