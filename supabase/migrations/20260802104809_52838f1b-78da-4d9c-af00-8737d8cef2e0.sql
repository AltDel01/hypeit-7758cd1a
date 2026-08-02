CREATE POLICY "Admins manage payment assets" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'payment-assets' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'payment-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users upload own payment proofs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-assets'
    AND (storage.foldername(name))[1] = 'proofs'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users view own payment proofs" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-assets'
    AND (
      (storage.foldername(name))[1] = 'qris'
      OR ((storage.foldername(name))[1] = 'proofs' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );