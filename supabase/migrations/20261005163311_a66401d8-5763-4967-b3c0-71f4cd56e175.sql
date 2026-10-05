CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE TABLE IF NOT EXISTS public.internal_config (key text PRIMARY KEY, value text NOT NULL);
GRANT ALL ON public.internal_config TO service_role;
REVOKE ALL ON public.internal_config FROM anon, authenticated;
ALTER TABLE public.internal_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.internal_config(key, value)
VALUES ('signup_notify_secret', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.notify_admin_new_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE s text;
BEGIN
  BEGIN
    SELECT value INTO s FROM public.internal_config WHERE key = 'signup_notify_secret';
    PERFORM net.http_post(
      url := 'https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object('Content-Type','application/json','x-internal-secret', s,
        'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd2lueGJ1YWxwY2l2a3VqbGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTU1MTAsImV4cCI6MjA1ODIzMTUxMH0.GK4ljHmyWStpkHWwsdLH7_22BzqNSeWSLCRSV9lWndc'),
      body := jsonb_build_object('type','signup',
        'userName', COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
        'userEmail', NEW.email, 'timestamp', now())
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_admin_new_signup failed: %', SQLERRM;
  END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_notify ON auth.users;
CREATE TRIGGER on_auth_user_created_notify AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_signup();