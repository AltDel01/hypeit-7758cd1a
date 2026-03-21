

# Track Video Played & Downloaded Status in Admin Credit History

## What
Add two new columns to the `generation_requests` table — `video_played_at` and `video_downloaded_at` — to track when a user plays or downloads their completed result. Display these in the admin credit history slide-out panel with ✅/❌ indicators and timestamps.

## Database Change

**Migration**: Add two nullable timestamp columns to `generation_requests`:
```sql
ALTER TABLE public.generation_requests
  ADD COLUMN video_played_at timestamptz DEFAULT NULL,
  ADD COLUMN video_downloaded_at timestamptz DEFAULT NULL;
```

No RLS changes needed — existing policies already cover UPDATE for users on their own rows and SELECT for admins.

## Client-Side Tracking (User Dashboard)

**1. Track "Video Played"** — in `src/components/dashboard/RequestDetailView.tsx`:
- Add an `onPlay` event handler to the `<video>` element
- When fired, update `generation_requests.video_played_at = now()` for that request (only if not already set)

**2. Track "Video Downloaded"** — in `src/components/dashboard/RequestDetailView.tsx`:
- Inside the existing `handleDownload` function, after successful download, update `generation_requests.video_downloaded_at = now()` (only if not already set)

Both updates use: `supabase.from('generation_requests').update({ video_played_at: new Date().toISOString() }).eq('id', request.id).is('video_played_at', null)`

This covers both scenarios: user opens from email deep-link or from history sidebar — both lead to `RequestDetailView`.

## Admin Display

**3. Update `src/components/admin/UserCreditHistory.tsx`**:
- Fetch the two new columns (`video_played_at`, `video_downloaded_at`) in the query
- Add two new columns in the desktop table: "Played" and "Downloaded"
- Show ✅ with timestamp tooltip (or inline small text) when set, ❌ when null
- In mobile cards, add a row showing played/downloaded status with the same indicators
- Only show these columns for `request_type === 'video'` rows; show "—" for image requests

## Summary of files changed
- **Migration**: 1 new migration adding 2 columns
- `src/components/dashboard/RequestDetailView.tsx` — add play/download tracking calls
- `src/components/admin/UserCreditHistory.tsx` — display played/downloaded columns

