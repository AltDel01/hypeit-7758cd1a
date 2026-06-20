ALTER TABLE public.creative_days ADD COLUMN IF NOT EXISTS generated_at timestamptz;

CREATE TABLE public.creative_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  strategy_id uuid,
  day_id uuid,
  day text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  concept text NOT NULL DEFAULT '',
  hook text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  asset_type text NOT NULL DEFAULT 'image',
  asset_url text,
  platforms jsonb NOT NULL DEFAULT '{"tiktok": true, "instagram": false, "facebook": false}'::jsonb,
  scheduled_time text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_posts TO authenticated;
GRANT ALL ON public.creative_posts TO service_role;

ALTER TABLE public.creative_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts"
  ON public.creative_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posts"
  ON public.creative_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts"
  ON public.creative_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts"
  ON public.creative_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_creative_posts_user ON public.creative_posts(user_id, created_at DESC);
CREATE UNIQUE INDEX idx_creative_posts_day ON public.creative_posts(day_id) WHERE day_id IS NOT NULL;

CREATE TRIGGER update_creative_posts_updated_at
  BEFORE UPDATE ON public.creative_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_generation_requests_updated_at();