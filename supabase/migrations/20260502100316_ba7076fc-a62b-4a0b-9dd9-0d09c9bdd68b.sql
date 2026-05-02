ALTER TABLE public.generation_requests
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS auto_provider text,
  ADD COLUMN IF NOT EXISTS auto_model text,
  ADD COLUMN IF NOT EXISTS auto_failed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS provider_task_id text,
  ADD COLUMN IF NOT EXISTS result_layers jsonb;

UPDATE public.generation_requests
SET category = CASE
  WHEN request_type = 'image' THEN 'image-gen'
  WHEN request_type = 'video' THEN 'video-edit-manual'
  ELSE category
END
WHERE category IS NULL;

CREATE INDEX IF NOT EXISTS idx_generation_requests_category ON public.generation_requests(category);
CREATE INDEX IF NOT EXISTS idx_generation_requests_auto_failed ON public.generation_requests(auto_failed) WHERE auto_failed = true;
CREATE INDEX IF NOT EXISTS idx_generation_requests_provider_task_id ON public.generation_requests(provider_task_id) WHERE provider_task_id IS NOT NULL;