
CREATE TABLE public.creative_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_name TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  brand_message TEXT NOT NULL DEFAULT '',
  brand_color TEXT NOT NULL DEFAULT '#8C52FF',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_strategies TO authenticated;
GRANT ALL ON public.creative_strategies TO service_role;

ALTER TABLE public.creative_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own strategies"
  ON public.creative_strategies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all strategies"
  ON public.creative_strategies FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.creative_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.creative_strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft',
  benchmark TEXT NOT NULL DEFAULT '',
  concept TEXT NOT NULL DEFAULT '',
  hook TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  scenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  asset_type TEXT NOT NULL DEFAULT 'image',
  asset_url TEXT,
  gen_stage TEXT NOT NULL DEFAULT 'idle',
  platforms JSONB NOT NULL DEFAULT '{"tiktok":true,"instagram":false,"facebook":false}'::jsonb,
  scheduled_time TEXT NOT NULL DEFAULT '16:30',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_days TO authenticated;
GRANT ALL ON public.creative_days TO service_role;

ALTER TABLE public.creative_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own days"
  ON public.creative_days FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all days"
  ON public.creative_days FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_creative_strategies_updated_at
  BEFORE UPDATE ON public.creative_strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_generation_requests_updated_at();

CREATE TRIGGER update_creative_days_updated_at
  BEFORE UPDATE ON public.creative_days
  FOR EACH ROW EXECUTE FUNCTION public.update_generation_requests_updated_at();
