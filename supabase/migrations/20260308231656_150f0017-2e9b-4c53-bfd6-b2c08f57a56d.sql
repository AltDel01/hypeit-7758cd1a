CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  edge_function_url TEXT;
BEGIN
  edge_function_url := 'https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/send-welcome-email';

  BEGIN
    PERFORM extensions.http_post(
      edge_function_url,
      jsonb_build_object('email', NEW.email, 'display_name', NEW.display_name)
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Welcome email call failed for %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;