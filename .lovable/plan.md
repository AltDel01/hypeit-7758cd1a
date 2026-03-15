

# Fix Credit System: One-Time 500 Credits (Not Monthly)

## The Problem
You don't want 500 credits resetting every month for free users — that's too generous. Free users should get **500 credits total, one time**. When they run out, they must upgrade or buy more.

## Current State
- Trigger `on_generation_request_completed` **exists and is working** — credits ARE being deducted on completion. The earlier query from `information_schema.triggers` was misleading (it doesn't show all trigger types). The `pg_trigger` system table confirms it's active.
- Your account (eka@viralin.ai): 150 used out of 500 = 350 remaining. This is correct.

## What Will Change

### 1. Disable the monthly reset for free-tier users
The `reset_monthly_usage()` function currently resets ALL users to 0. We'll change it to **only reset paid tier users**, so free users' credits never reset:

```sql
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only reset paid subscribers, not free tier
  UPDATE public.profiles
  SET generations_this_month = 0
  WHERE subscription_tier != 'free';
END;
$$;
```

### 2. Update frontend labels
Change "monthly" language to reflect one-time credits for free users. In the credit usage page and credit display components, show "Lifetime Credits" instead of "Monthly Usage" for free-tier users.

### 3. No other DB changes needed
- The trigger is already working
- The 500 limit is already set
- The backfilled usage data is correct

## Files to Modify

| Target | Change |
|--------|--------|
| SQL migration | Update `reset_monthly_usage()` to skip free-tier users |
| `src/pages/CreditUsage.tsx` | Show "Lifetime" instead of "Monthly" for free tier |
| `src/hooks/useUserCredits.ts` | No changes needed (already reads correct values) |

