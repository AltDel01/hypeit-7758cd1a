
-- Add credits_used column to generation_requests
ALTER TABLE public.generation_requests
  ADD COLUMN credits_used integer NOT NULL DEFAULT 10;

-- Update the track_generation_usage trigger function to use credits_used
CREATE OR REPLACE FUNCTION public.track_generation_usage()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET generations_this_month = generations_this_month + NEW.credits_used
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_generation_request_created ON public.generation_requests;
CREATE TRIGGER on_generation_request_created
  AFTER INSERT ON public.generation_requests
  FOR EACH ROW EXECUTE FUNCTION public.track_generation_usage();
