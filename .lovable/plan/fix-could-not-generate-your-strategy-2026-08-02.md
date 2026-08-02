# Fix "Could not generate your strategy"

## What is actually happening

The AI part works. I called the `generate-strategy` function directly with your Evolene inputs and it returned a full, correct 7-day plan.

The failure happens on the step right after, when the 7 days are saved to the database:

- The function returns each day with the field `asset_type`, but the app reads `d.assetType` when building the rows to insert.
- `asset_type` is a NOT NULL column, so the insert is rejected and the whole action falls into the catch block, which shows "Could not generate your strategy. Try again."

Evidence in the database: your two attempts at 04:53 today created strategy rows (`Evolene`) with **0 days** attached, same for `HFGOLD` and older `Cleanova` attempts. Only the runs from before this field name drift have 7 days.

## Changes

1. In `src/components/tools/CreativeWorkflow.tsx`, map the day rows from the field the function actually returns (`asset_type`), with a safe fallback (`image`) if it is ever missing. Same fix for any other field read off the AI response that does not match the function's shape.
2. Make the save transactional in effect: if inserting the 7 days fails, delete the just-created strategy row so no more empty strategies accumulate and the next attempt starts clean.
3. Surface the real database message in the toast instead of the generic text, so a future save failure is diagnosable at a glance.
4. Clean up the orphaned strategy rows that have 0 days (Evolene x2, HFGOLD x2, Cleanova x2), since those are the failed attempts and one of them is what the Brand Profile keeps restoring.

## Technical notes

- Root cause is a client-side field name mismatch only. No change is needed in `supabase/functions/generate-strategy/index.ts`.
- Table grants and RLS on `creative_strategies` / `creative_days` were checked and are correct.
- Cleanup is a delete limited to rows with no child `creative_days`, scoped by strategy id.
