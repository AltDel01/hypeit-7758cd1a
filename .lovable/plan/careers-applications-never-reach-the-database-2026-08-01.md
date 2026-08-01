# Careers applications never reach the database

## What I found (verified)

- The `career_applications` table has **zero rows**. Nothing has been submitted successfully, so there is no "lost" application sitting somewhere unforwarded.
- The table has **no permission grants at all** for the public API roles (`anon`, `authenticated`, `service_role`). Access rules for anonymous submission exist, but without grants the API rejects every insert with a permission error before the rules are ever evaluated.
- The CV storage bucket has **no files** either, and its upload rules are correct, so the applicant's upload also failed only because the form aborts on the first error.
- Result: an applicant fills the form, hits Submit, and gets the generic "Failed to submit" message. The notification email is only sent after a successful insert, so nothing was emailed either.

## Fix

1. Grant the missing API permissions on `career_applications`:
   - anonymous visitors: submit only (matching the existing "Anyone can submit applications" rule)
   - signed-in users: submit only
   - internal/admin service access: full access
   Existing access rules stay unchanged, so only admins can read, edit, or delete applications.

2. Improve the failure feedback on the apply form so a real error message is shown and logged instead of a generic "Please try again later", making any future breakage visible immediately.

3. Verify end to end: submit a test application anonymously in the preview, confirm it appears in the admin Careers panel with the CV downloadable, then delete the test row.

## Technical notes

- Migration: `GRANT INSERT ON public.career_applications TO anon, authenticated;` plus `GRANT ALL ... TO service_role;` (no SELECT for anon/authenticated, keeping applicant data admin-only).
- Frontend touch: `src/pages/CareerApply.tsx` error handling only.
- Ask the applicant to resubmit once the fix is live, since their submission was never stored.
