CREATE TABLE IF NOT EXISTS public.app_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_flags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_flags TO authenticated;
GRANT ALL ON public.app_flags TO service_role;
ALTER TABLE public.app_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app flags" ON public.app_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage app flags" ON public.app_flags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_flags (key, enabled) VALUES ('free_generation_paused', true)
ON CONFLICT (key) DO UPDATE SET enabled = true, updated_at = now();

-- Paid = non-free plan, a settled payment, or staff (admin/editor).
CREATE OR REPLACE FUNCTION public.can_generate(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND (
    NOT COALESCE((SELECT enabled FROM public.app_flags WHERE key = 'free_generation_paused'), false)
    OR public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'editor')
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _user_id AND COALESCE(lower(p.subscription_tier), 'free') <> 'free')
    OR EXISTS (SELECT 1 FROM public.payment_orders o WHERE o.user_id = _user_id AND o.status = 'paid')
  )
$$;
REVOKE ALL ON FUNCTION public.can_generate(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_generate(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.can_i_generate()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT public.can_generate(auth.uid()) $$;
REVOKE ALL ON FUNCTION public.can_i_generate() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_i_generate() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.block_free_generation_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_generate(NEW.user_id) THEN
    RAISE EXCEPTION 'Free plan generation is paused. Please upgrade to continue.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS block_free_generation_requests ON public.generation_requests;
CREATE TRIGGER block_free_generation_requests
BEFORE INSERT ON public.generation_requests
FOR EACH ROW EXECUTE FUNCTION public.block_free_generation_requests();