CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only reset paid subscribers, not free tier
  -- Free tier users get 500 one-time credits that never reset
  UPDATE public.profiles
  SET generations_this_month = 0
  WHERE subscription_tier IS DISTINCT FROM 'free';
END;
$$;