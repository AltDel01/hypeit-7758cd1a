CREATE TABLE public.broll_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'planned',
  source_name TEXT,
  source_duration NUMERIC,
  orientation TEXT,
  plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  clips JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_url TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.broll_jobs TO authenticated;
GRANT ALL ON public.broll_jobs TO service_role;

ALTER TABLE public.broll_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own broll jobs"
ON public.broll_jobs FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_broll_jobs_user_created ON public.broll_jobs (user_id, created_at DESC);

CREATE TRIGGER update_broll_jobs_updated_at
BEFORE UPDATE ON public.broll_jobs
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();