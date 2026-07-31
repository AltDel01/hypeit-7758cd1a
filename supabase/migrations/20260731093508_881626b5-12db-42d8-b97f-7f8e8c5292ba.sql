ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS email text;

GRANT INSERT ON public.career_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_applications TO authenticated;
GRANT ALL ON public.career_applications TO service_role;