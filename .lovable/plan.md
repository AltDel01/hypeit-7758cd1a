

## Master Admin Dashboard — Plan

Yes, creating a separate **Master Admin** dashboard is a strong idea. Right now, the single `admin` role serves both the person managing the business and the video editors doing the work. Separating them gives you proper oversight and control.

### Current vs. Proposed Role Structure

```text
Current:
  admin ──► can see all requests, claim, upload results

Proposed:
  admin (master) ──► manage editors, assign jobs, view stats
  editor (new role) ──► claim/receive assigned jobs, upload results
```

### What the Master Admin Dashboard Would Include

1. **Editor Management** — Register new editor accounts (invite by email), activate/deactivate editors, view editor list
2. **Job Assignment** — Assign specific requests to specific editors (not just self-claim), reassign if needed
3. **Job Tracking** — See which editor is working on what, time spent per request, completion timestamps
4. **Editor Performance Stats** — Requests completed per editor, average turnaround time, completion rate, active vs idle editors

### Technical Changes Required

**Database:**
- Add `editor` to the `app_role` enum
- Create an `editor_profiles` or reuse `profiles` table with editor-specific metadata (e.g., `is_active`, `specialization`)
- Add tracking columns to `generation_requests`: `assigned_at` timestamp (to calculate turnaround time)
- Possibly a new `editor_stats` view or materialized view for aggregated performance data

**Backend (RLS & Functions):**
- New RLS policies so `editor` role users can only see/update requests assigned to them
- New `has_role` checks distinguishing `admin` from `editor`
- Edge function or DB function to create editor accounts (admin-only)

**Frontend:**
- New `/admin/editors` page — list, register, manage editors
- New `/admin/stats` page — performance dashboard with charts (recharts already installed)
- Update existing `/admin` to be master-admin-only
- New `/editor` dashboard — simplified view showing only assigned tasks
- Update `AdminRoute` to differentiate admin vs editor access

**Auth Flow:**
- Master admin registers editor accounts via Supabase `auth.admin.createUser()` (requires service role key, so this must go through an edge function)
- Editor gets credentials and logs in via `/admin-login`

### Estimated Scope

This is a significant feature set. Recommended build order:
1. Add `editor` role to enum + RLS policies
2. Build edge function for admin to create editor accounts
3. Build editor management page (`/admin/editors`)
4. Update request assignment to support admin-assigns-editor flow
5. Build editor-only dashboard (`/editor`)
6. Add performance tracking columns and stats page

### Decision Point

Before building, we should confirm the role naming and whether editors should still be able to self-claim jobs or only work on admin-assigned tasks.

