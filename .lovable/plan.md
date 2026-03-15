

# Fix Default Credit Limits & Backfill Usage

## The Problem

Right now every user has `monthly_generation_limit = 25` and `generations_this_month = 0`, even though some users (like your account with 290 actual credits used) have made real generation requests. This is because:

1. The old limit of 25 was designed for "25 generations" (flat count), not "25 credits" — but now a single generation can cost 60-200+ credits
2. The trigger that tracks usage was added after existing requests were made, so past usage was never counted

## What Will Change

### 1. Update all existing free-tier users' limit from 25 to 500
Every profile currently on the `free` tier gets `monthly_generation_limit = 500`.

### 2. Backfill `generations_this_month` from actual usage
For each user, sum up all `credits_used` from their `generation_requests` and set that as their `generations_this_month`. Your account would go from 0 to 290 (leaving you 210 credits remaining).

### 3. Update `handle_new_user()` function
New signups will get `monthly_generation_limit = 500` instead of the default 25.

### 4. Update the profiles table default
Change the column default from 25 to 500.

## Files to Modify

| Target | Change |
|--------|--------|
| DB migration | ALTER profiles default to 500, UPDATE existing free users to 500, backfill `generations_this_month` from `generation_requests` |
| DB migration | Replace `handle_new_user()` to set limit = 500 |

No frontend code changes needed — the existing `useUserCredits` hook already reads these values correctly.

## After This

Your credit display would show: **210 / 500 credits remaining** (500 limit minus 290 used).

