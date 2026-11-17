REVOKE ALL ON FUNCTION public.block_free_generation_requests() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Admins manage app flags" ON public.app_flags;
CREATE POLICY "Admins insert app flags" ON public.app_flags FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update app flags" ON public.app_flags FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete app flags" ON public.app_flags FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));