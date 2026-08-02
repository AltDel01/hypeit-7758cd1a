# Brand Profile pre-filled fields

## Why it happens

Brand Profile is a one-time setup. On mount, Creative Workflow loads your most recent saved strategy from `creative_strategies` and fills Brand Name, "What are you selling?", Brand Message/Tone and Brand Color from it. So after your first setup, reopening the profile shows the saved values, that is expected.

One real issue found: the load query selects the newest row with no `user_id` filter, relying only on row-level security. Because admin accounts have a policy that lets them read every strategy, an admin opening Creative Workflow can load another user's brand profile instead of their own.

## Changes

1. Scope the strategy load to the signed-in user (`.eq('user_id', currentUserId)`), and skip loading entirely when signed out. This fixes the admin cross-user prefill.
2. Make the prefill obvious and controllable in the Brand Profile form:
   - Show a short "Loaded from your saved brand profile" note when fields come from a saved strategy.
   - Add a "Clear fields" action next to Save/Edit so a fresh brand can be entered without manually emptying each input.
3. Prevent the auto brand-scan from firing on freshly loaded saved values (seed the debounce signature after load) so saved Message/Tone and Color are not silently overwritten.

## Technical notes

All in `src/components/tools/CreativeWorkflow.tsx`: the mount `useEffect` that queries `creative_strategies`/`creative_days`, the auto-scan `useEffect` (`lastScanSig`), and the Brand Profile card JSX. No schema or edge function changes.
