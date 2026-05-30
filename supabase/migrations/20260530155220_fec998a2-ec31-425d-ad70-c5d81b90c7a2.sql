ALTER TABLE public.generation_requests
ADD COLUMN IF NOT EXISTS result_images jsonb;