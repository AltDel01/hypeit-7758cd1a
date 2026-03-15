-- Remove stale INSERT trigger (no longer needed)
DROP TRIGGER IF EXISTS on_generation_request_created ON public.generation_requests;

-- Remove duplicate welcome email trigger
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;