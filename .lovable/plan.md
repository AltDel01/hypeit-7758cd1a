

# Database Cleanup: Remove Stale Triggers

## Issues Found

1. **Stale INSERT trigger on generation_requests** — `on_generation_request_created` still exists from the old "deduct on insert" logic. It's harmless (the function's IF condition prevents it from doing anything) but wastes resources on every new request.

2. **Duplicate welcome email triggers on profiles** — Two triggers (`on_profile_created_send_welcome_email` and `trigger_send_welcome_email`) both fire on INSERT, sending the welcome email twice per signup.

## What's Working Correctly
- `on_generation_request_completed` (AFTER UPDATE) — active, correctly deducting credits only on completion
- `track_generation_usage()` function — logic is correct
- `reset_monthly_usage()` — correctly skips free-tier users
- All user balances match their actual completed usage (verified)

## Changes

### 1 SQL migration

```sql
-- Remove stale INSERT trigger (no longer needed)
DROP TRIGGER IF EXISTS on_generation_request_created ON public.generation_requests;

-- Remove duplicate welcome email trigger
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;
```

That's it — two lines. No function changes, no data changes. Just removing unnecessary triggers.

