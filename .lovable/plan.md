

## Fix Stale Request Email Flooding & Duplicates

### Changes

**1. `supabase/functions/check-stale-requests/index.ts`**
- Add a lower bound to the query: only check requests created within the last 30 minutes (not all historical requests). Anything older than 30 minutes that wasn't notified is stale beyond recovery and shouldn't trigger alerts now.
- This prevents the "historical flood" problem.

**2. Database migration: Reset `stale_notified_at` on old requests**
- Run a one-time update to set `stale_notified_at = now()` on ALL existing "new" requests older than 30 minutes that still have `stale_notified_at IS NULL`. This prevents re-flooding if the function runs again before the code fix deploys.

**3. Prevent duplicate sends (race condition fix)**
- In the edge function, do an atomic "claim" before sending: `UPDATE generation_requests SET stale_notified_at = now() WHERE id = X AND stale_notified_at IS NULL` and check if the update actually modified a row. If another invocation already claimed it, skip the email.
- This ensures only one invocation can "win" per request.

### Summary
- 2 file changes: edge function + 1 migration
- Fixes both the historical flood and the duplicate race condition

### Technical Detail

The atomic claim pattern:
```
UPDATE generation_requests 
SET stale_notified_at = now() 
WHERE id = :id AND stale_notified_at IS NULL
```
If `rowCount = 0`, another invocation already claimed it — skip the email. This is a standard optimistic locking pattern.

The 30-minute window:
```sql
.gt("created_at", thirtyMinAgo)  -- lower bound
.lt("created_at", fiveMinAgo)    -- upper bound (existing)
```

