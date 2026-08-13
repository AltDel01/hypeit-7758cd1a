ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_name text;

CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON public.profiles (country_code);