GRANT INSERT ON public.career_applications TO anon;
GRANT INSERT ON public.career_applications TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.career_applications TO authenticated;
GRANT ALL ON public.career_applications TO service_role;