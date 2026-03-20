

## Add Credit Usage History Per User in Admin Credits Tab

**What**: When an admin clicks on a user row in the Credits tab, an expandable detail panel (or dialog) shows that user's complete generation request history with credit deductions -- useful for investigating complaints or disputes.

### Approach

**Expand-on-click pattern**: Clicking a user row in the existing credits table opens a Dialog/Sheet showing that user's `generation_requests` history, sorted by most recent first.

### Changes

**1. Create `src/components/admin/UserCreditHistory.tsx`**
- New component that receives a `userId` and `userName` props
- Fetches from `generation_requests` where `user_id = userId`, ordered by `created_at DESC`
- Displays a table/list with columns: Date, Request Type, Prompt (truncated), Status, Credits Used
- Color-code status badges (completed = green, pending = yellow, failed = red)
- Show a summary at top: total credits consumed, number of requests
- Mobile-responsive with card layout on small screens
- Include a "No history found" empty state

**2. Update `src/components/admin/AdminCreditsSection.tsx`**
- Add state for `selectedUser: UserCredit | null`
- Make each user row clickable (cursor-pointer, hover effect)
- On click, set `selectedUser` and open a Dialog/Sheet
- Render `UserCreditHistory` inside the dialog, passing the selected user's ID and display name
- Add a visual affordance (e.g., chevron icon or "View history" text) to indicate rows are clickable

### Data Source
- Query: `supabase.from('generation_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false })`
- Admin already has RLS SELECT access to all generation_requests -- no migration needed

### History Table Columns
| Date | Type | Prompt | Status | Credits |
|------|------|--------|--------|---------|
| Mar 20, 2026 14:30 | video | "Create a viral..." | completed | 70 |

