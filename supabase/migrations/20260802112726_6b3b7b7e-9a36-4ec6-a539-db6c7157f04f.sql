CREATE TABLE public.internal_keys (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.internal_keys TO service_role;
ALTER TABLE public.internal_keys ENABLE ROW LEVEL SECURITY;

INSERT INTO public.internal_keys (key, value)
VALUES ('qris_cron', encode(extensions.gen_random_bytes(32), 'hex'));