
-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to call the welcome email edge function on new profile insert
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  edge_function_url TEXT;
  anon_key TEXT;
BEGIN
  edge_function_url := 'https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/send-welcome-email';
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd2lueGJ1YWxwY2l2a3VqbGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTU1MTAsImV4cCI6MjA1ODIzMTUxMH0.GK4ljHmyWStpkHWwsdLH7_22BzqNSeWSLCRSV9lWndc';

  PERFORM extensions.http_post(
    edge_function_url,
    json_build_object('email', NEW.email, 'display_name', NEW.display_name)::text,
    'application/json',
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || anon_key),
      extensions.http_header('Content-Type', 'application/json')
    ]
  );

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table (fires after handle_new_user creates the profile)
CREATE TRIGGER on_profile_created_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();
