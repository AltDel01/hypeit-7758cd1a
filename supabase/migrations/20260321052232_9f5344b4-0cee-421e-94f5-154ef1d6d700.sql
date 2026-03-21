ALTER TABLE public.generation_requests
  ADD COLUMN video_played_at timestamptz DEFAULT NULL,
  ADD COLUMN video_downloaded_at timestamptz DEFAULT NULL;