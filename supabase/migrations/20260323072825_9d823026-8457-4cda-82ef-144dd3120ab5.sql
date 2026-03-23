-- Add columns to track editor SLA warning notifications
ALTER TABLE public.generation_requests
ADD COLUMN IF NOT EXISTS editor_warn_5min_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS editor_warn_10min_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS editor_warn_15min_at timestamptz DEFAULT NULL;

-- Mark ALL existing assigned requests as already notified so they don't trigger alerts
UPDATE public.generation_requests
SET 
  editor_warn_5min_at = now(),
  editor_warn_10min_at = now(),
  editor_warn_15min_at = now()
WHERE assigned_to IS NOT NULL;