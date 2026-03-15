-- 1. Rewrite track_generation_usage() to only deduct on completion
CREATE OR REPLACE FUNCTION public.track_generation_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.profiles
    SET generations_this_month = generations_this_month + NEW.credits_used
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Create the AFTER UPDATE trigger
DROP TRIGGER IF EXISTS on_generation_request_completed ON public.generation_requests;
CREATE TRIGGER on_generation_request_completed
  AFTER UPDATE ON public.generation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.track_generation_usage();

-- 3. Re-backfill from completed requests only
UPDATE public.profiles p
SET generations_this_month = COALESCE(sub.total_used, 0)
FROM (
  SELECT user_id, SUM(credits_used) AS total_used
  FROM public.generation_requests
  WHERE status = 'completed'
  GROUP BY user_id
) sub
WHERE p.id = sub.user_id;

UPDATE public.profiles
SET generations_this_month = 0
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM public.generation_requests WHERE status = 'completed'
);