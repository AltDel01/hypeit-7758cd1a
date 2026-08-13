# Login blocked: Supabase project is over quota

The login error is not an app bug. Your Supabase project has been put into a restricted state, so the Auth API rejects every request with HTTP 402:

> exceed_db_size_quota, exceed_storage_size_quota

## What I found

Database: **1661 MB** used. Almost all of it is background job logging, not your app data:

| Table | Size |
|---|---|
| cron.job_run_details | 1013 MB |
| net._http_response | 629 MB |
| everything else (auth, profiles, generation_requests, ...) | under 20 MB total |

Storage: **~2.2 GB** of files:

| Bucket | Files | Size |
|---|---|---|
| generated-images | 274 | 2008 MB |
| product-images | 247 | 227 MB |
| avatars / career-applications / payment-assets | 6 | ~4 MB |

The cron/http log growth comes from the pg_cron jobs added for wan-video polling, stale requests, and SLA checks, which write a row per run and never get pruned.

## Fix

1. **Purge the log tables.** Delete old rows from `cron.job_run_details` and `net._http_response`, then run a full vacuum so the disk is actually returned. This alone drops the database from ~1.6 GB to well under 100 MB.
2. **Add a retention job.** A small nightly pg_cron job that keeps only the last 3 days of `cron.job_run_details` and `net._http_response`, so this never recurs.
3. **Reduce storage.** The 2 GB in `generated-images` is what triggers the storage cap. Options, pick one:
   - Delete generated images older than a chosen date (e.g. anything over 60 days) plus any orphaned files with no matching database row.
   - Keep everything and raise the storage limit on your Supabase plan.
4. **Verify.** Re-check database and bucket sizes, then confirm login works again.

## Notes

- Steps 1 and 2 are safe: nothing there is app data, they are execution logs.
- Step 3 permanently deletes user-generated images, so I need your call before doing it.
- After the sizes are back under quota, Supabase lifts the restriction and sign-in works again. If it does not clear automatically, the restriction can also be lifted from the Supabase dashboard billing page.

## Decision needed

Should I delete old generated images (and which cutoff), or do you prefer to upgrade the storage limit and keep them all?
