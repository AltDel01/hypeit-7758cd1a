
-- 1. Change the column default from 25 to 500
ALTER TABLE public.profiles ALTER COLUMN monthly_generation_limit SET DEFAULT 500;

-- 2. Update all existing free-tier users' limit to 500
UPDATE public.profiles
SET monthly_generation_limit = 500
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

-- 3. Backfill generations_this_month from actual usage
UPDATE public.profiles p
SET generations_this_month = sub.total_used
FROM (
  SELECT user_id, COALESCE(SUM(credits_used), 0) AS total_used
  FROM public.generation_requests
  GROUP BY user_id
) sub
WHERE p.id = sub.user_id;

-- 4. Update handle_new_user() to set limit = 500
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, monthly_generation_limit)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 500);
  RETURN new;
END;
$$;
