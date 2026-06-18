## Goal

Make the Brand Profile a **one-time setup**. Once a user has generated and saved a strategy, their next visit to Creative Workflow skips the whole intake form and shows the 7-day calendar immediately. They can still reopen the brand profile to edit it or regenerate.

## Answer: can Meta OAuth post to a user's Instagram / Facebook from us?

Yes, but with real conditions:

- **Instagram**: Posting on a user's behalf works **only for Instagram Business or Creator accounts that are linked to a Facebook Page**, via the Instagram Graph API (`/media` then `/media_publish`). It does **not** work for personal Instagram accounts.
- **Facebook**: We can post to a **Facebook Page** the user manages (Pages API), not to a personal Facebook profile/timeline (Meta removed that ability years ago).
- **Approval required**: Meta requires App Review for the permissions (`instagram_content_publish`, `pages_manage_posts`, `business_management`, etc.) and a Business Verification before it works for accounts other than your own test users. This takes time, similar to TikTok.

So Meta OAuth is the correct, policy-compliant path, but it can only auto-post to **IG Business/Creator accounts and Facebook Pages**, and only after Meta approves the app. Personal accounts can never be auto-posted to by any compliant method, which is also why the username/password approach is both against Meta's terms and limited. This is worth knowing before we build Phase 4.

## What changes (this task)

Only the `CreativeWorkflow.tsx` UI/flow. No database or edge function changes.

```text
First visit (no saved strategy)        Return visit (strategy exists)
┌────────────────────────────┐        ┌────────────────────────────┐
│ Brand Profile form          │        │ Compact header:             │
│ + scan + product            │  ───►  │  "Glowance · edit profile"  │
│ + Generate Strategy button  │        │ 7-day calendar (immediately)│
└────────────────────────────┘        └────────────────────────────┘
```

### Behavior

1. On mount, the component already loads the most recent saved strategy. If one exists (days are present), render the **calendar directly** and **hide** the Brand Profile card and the "Generate Strategy" control bar.
2. Add a small **brand summary bar** above the calendar showing the saved brand name (and product), with an **"Edit brand profile"** button.
3. Clicking "Edit brand profile" reveals the existing Brand Profile form again (collapsed by default) so the user can update details and **Regenerate** the 7-day strategy. After regenerating, it collapses back to the calendar.
4. First-time users (no saved strategy) see exactly today's flow: the full Brand Profile form and the generate button.
5. While the initial load is still running, keep the existing "Loading your saved workflow..." state so the form doesn't flash before we know whether a strategy exists.

### Technical notes

- Drive this with a derived flag like `hasStrategy = !!days && days.length > 0` plus an `editingProfile` state (default `false`).
- Show the Brand Profile `Card` and control-bar `Card` only when `!hasStrategy || editingProfile`.
- Show the new summary bar only when `hasStrategy && !editingProfile`.
- Reuse the existing `handleStrategy`; on success, set `editingProfile = false`.
- No schema changes: "one-time" is enforced purely by the presence of a saved strategy for the user, which already persists in `creative_strategies` / `creative_days`.
