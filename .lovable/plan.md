

# Add Admin Credit Usage Overview

## What
Add a new "Credits" tab to the admin panel showing all users' credit balances and usage at a glance.

## Changes

### 1. New component: `src/components/admin/AdminCreditsSection.tsx`
- Query `profiles` table (admin has SELECT access via RLS) to fetch all users with their credit fields: `generations_this_month`, `monthly_generation_limit`, `bonus_credits`, `subscription_tier`, `email`, `display_name`
- Display a summary row: total credits consumed across all users, total remaining
- Sortable table showing each user with:
  - Name / Email
  - Plan tier
  - Credits used / limit
  - Bonus credits
  - Usage % (with color-coded progress bar)
- Search/filter by email or name
- Mobile card layout, desktop table layout (matching existing AdminStatsSection pattern)

### 2. Update `src/pages/Admin.tsx`
- Add a 4th tab "Credits" with a `Zap` icon
- Render `AdminCreditsSection` inside the new tab

### No database changes needed
Admin already has RLS SELECT access to all profiles.

