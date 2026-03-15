

# Fix Credit Deduction Trigger

## Problem
1. The `track_generation_usage()` trigger function exists but **no trigger** is attached to it — credits are never deducted in real-time
2. The function currently fires on INSERT (initial request), meaning users would be charged even for failed generations

## Changes

### 1. Rewrite `track_generation_usage()` to fire on UPDATE
The function will check if `status` just changed to `'completed'` and only then deduct credits:

```sql
CREATE OR REPLACE FUNCTION public.track_generation_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only deduct when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.profiles
    SET generations_this_month = generations_this_month + NEW.credits_used
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;
```

### 2. Create the trigger on `generation_requests`
```sql
CREATE TRIGGER on_generation_request_completed
  AFTER UPDATE ON public.generation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.track_generation_usage();
```

### 3. Re-backfill usage from only completed requests
Since the previous backfill counted ALL requests (including failed), we need to recalculate using only completed ones:

```sql
UPDATE public.profiles p
SET generations_this_month = COALESCE(sub.total_used, 0)
FROM (
  SELECT user_id, SUM(credits_used) AS total_used
  FROM public.generation_requests
  WHERE status = 'completed'
  GROUP BY user_id
) sub
WHERE p.id = sub.user_id;

-- Zero out users with no completed requests
UPDATE public.profiles
SET generations_this_month = 0
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM public.generation_requests WHERE status = 'completed'
);
```

### Files
- **1 SQL migration** — all of the above

No frontend code changes needed. The client-side pre-check in `createGenerationRequest` still validates the user has enough credits before submitting (preventing wasteful requests), but actual deduction only happens on completion.

