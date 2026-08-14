CREATE POLICY "Users read own broll media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'broll-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own broll media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'broll-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own broll media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'broll-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own broll media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'broll-media' AND auth.uid()::text = (storage.foldername(name))[1]);