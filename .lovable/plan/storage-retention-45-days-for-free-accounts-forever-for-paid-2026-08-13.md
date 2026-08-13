# Storage retention: 45 days for free accounts, forever for paid

Make the cleanup tier-aware so paying customers never lose their generated assets.

## Rule

- Free tier accounts: generated files older than 45 days are deleted.
- Paid accounts (Starter / Pro / Specialist, or anyone with purchased credits): files are kept indefinitely.
- Generation history records in the database are never deleted for anyone; only the stored file is removed for free accounts past 45 days.

## How it works

1. The cleanup job loads the set of paid user IDs from `profiles` (subscription tier other than free, or having an approved payment order).
2. While walking each bucket, files are grouped by the owning user (the first folder segment of the file path is the user ID).
3. A file is only queued for deletion when it is older than the cutoff AND its owner is not in the paid set.
4. Files that sit outside a user folder (no identifiable owner) fall back to the age rule, since they can't be attributed to a paying account.

## Technical notes

- Edit `supabase/functions/storage-cleanup/index.ts`: add a paid-user lookup before the bucket walk, and an owner check in the delete filter. Accept an optional `protectPaid` flag (default true) so a full-age purge can still be run manually.
- Verification step before enabling: run the function with `dryRun: true` to confirm the actual object path layout starts with the user ID; if some buckets use a different layout, map ownership from the corresponding table row (`generated_images.image_url`, `product_images.original_url`) instead.
- Report per-bucket counts split into `deleted` and `skippedPaid` so the run output shows what was protected.
- The nightly schedule and secret handling stay unchanged.

## Follow-up

After the tier-aware cleanup runs, storage usage will drop less than the earlier 45-day estimate (paid users' files are retained), so we should re-check whether the project lands under the 1 GB cap or still needs a plan upgrade.
