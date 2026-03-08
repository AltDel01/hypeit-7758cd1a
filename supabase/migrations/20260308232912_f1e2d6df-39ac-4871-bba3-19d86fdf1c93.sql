
-- Ensure handle_new_user trigger exists on auth.users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created' AND tgrelid = 'auth.users'::regclass) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Fix send_welcome_email_on_signup to send proper JSON with content-type header
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  edge_function_url TEXT;
  payload TEXT;
BEGIN
  edge_function_url := 'https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/send-welcome-email';
  payload := jsonb_build_object('email', NEW.email, 'display_name', NEW.display_name)::text;

  BEGIN
    PERFORM extensions.http((
      'POST',
      edge_function_url,
      ARRAY[extensions.http_header('Content-Type', 'application/json')],
      'application/json',
      payload
    )::extensions.http_request);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Welcome email call failed for %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;

-- Ensure welcome email trigger exists on profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_send_welcome_email' AND tgrelid = 'public.profiles'::regclass) THEN
    CREATE TRIGGER trigger_send_welcome_email
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.send_welcome_email_on_signup();
  END IF;
END
$$;
