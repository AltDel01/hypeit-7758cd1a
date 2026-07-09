CREATE TABLE public.trend_research (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry TEXT NOT NULL,
  platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
  report JSONB NOT NULL DEFAULT '{}'::jsonb,
  ideas JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trend_research TO authenticated;
GRANT ALL ON public.trend_research TO service_role;

ALTER TABLE public.trend_research ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trend research"
  ON public.trend_research FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trend research"
  ON public.trend_research FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trend research"
  ON public.trend_research FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_trend_research_user_created ON public.trend_research (user_id, created_at DESC);