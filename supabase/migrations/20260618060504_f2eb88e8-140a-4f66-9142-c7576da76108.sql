ALTER TABLE public.creative_days
  ADD COLUMN IF NOT EXISTS credits_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS request_id uuid;