# Make AI B-roll Studio reachable

## What's wrong

The B-roll Studio was built as a sub-tab of the `AIVideoEditor` component. That component is only referenced by an old dashboard sidebar that the live dashboard page does not use. Nothing in the app renders it, so the feature exists in code but has no way in from the UI.

## The fix

Add a permanent "Video Editor" entry to the dashboard's left tool rail (the same rail that holds Posting, Sequence, Ad Copy, Predictor, Lip Sync, Cinema, Workflow).

- New rail icon: film/clapperboard, label "Editor".
- Selecting it renders the AI Video Editor panel in the main content area, with its three existing sub-tabs: AI Editor, Viral Clip, AI B-roll.
- Behaves like every other tool: clicking it clears any selected history request, and the active state highlights in the brand purple.

No changes to the B-roll logic, credits, generation, or history, only the navigation wiring.

## Technical detail

- `src/pages/Dashboard.tsx`: extend the `ToolId` union and `TOOLS` array with `videoeditor`, import `AIVideoEditor` lazily or directly, and add the render branch next to the existing tool branches.
- Optionally remove the now-dead `src/components/dashboard/DashboardSidebar.tsx` if nothing else imports it.
