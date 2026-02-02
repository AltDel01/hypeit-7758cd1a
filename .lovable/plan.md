
# Dashboard Simplification Plan

## Overview
Transform the dashboard from a complex multi-section interface into a simple, single-page experience:
- **Center**: Large prompt box with immediate action (like Gemini/Lovable)
- **Left Sidebar**: User's generation history
- **Simple Backend**: User submits request → Admin receives & processes → Result appears for user

## New Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         DASHBOARD                                │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                               │
│  HISTORY PANEL   │              MAIN CONTENT                     │
│  (Left Sidebar)  │                                               │
│                  │   ┌─────────────────────────────────────┐    │
│  ┌────────────┐  │   │                                     │    │
│  │ Request 1  │  │   │     "What do you want to create?"   │    │
│  │ [pending]  │  │   │                                     │    │
│  ├────────────┤  │   │   ┌─────────────────────────────┐   │    │
│  │ Request 2  │  │   │   │  Describe your image/video  │   │    │
│  │ [complete] │  │   │   │  generation request...      │   │    │
│  ├────────────┤  │   │   └─────────────────────────────┘   │    │
│  │ Request 3  │  │   │                                     │    │
│  │ [pending]  │  │   │   [Upload Image] [Video] [Image]    │    │
│  └────────────┘  │   │                                     │    │
│                  │   │         [ Generate ]                │    │
│  Click to view   │   │                                     │    │
│  details/result  │   └─────────────────────────────────────┘    │
│                  │                                               │
│                  │   (Selected request details appear below)     │
│                  │                                               │
└──────────────────┴──────────────────────────────────────────────┘
```

## User Flow

1. **User lands on dashboard** → Sees prompt box front and center
2. **User enters prompt** → Optionally uploads reference image, selects type (video/image)
3. **User clicks "Generate"** → Request saved to DB, email sent to admin
4. **Request appears in history** → Shows "Processing" status
5. **Admin uploads result** → User sees notification, result appears in history

## What We'll Build

### 1. Simplified Dashboard Layout
**New file: `src/components/dashboard/SimplifiedDashboard.tsx`**
- Clean, centered prompt interface
- Type selector (Image / Video toggle)
- Optional image upload
- Generate button
- Mobile-responsive

### 2. Generation History Sidebar
**New file: `src/components/dashboard/GenerationHistory.tsx`**
- Lists all user's requests
- Status badges (Processing, Completed, Failed)
- Click to view details/result
- Real-time updates via Supabase subscription

### 3. Request Detail View
**New file: `src/components/dashboard/RequestDetailView.tsx`**
- Shows full request details when selected from history
- Displays result when completed (image/video)
- Download button for completed results

### 4. Update Dashboard Page
**Modify: `src/pages/Dashboard.tsx`**
- Replace complex section switching with new simplified layout
- Keep SidebarProvider for history panel

## Files to Remove/Archive
The following sections can be removed (or kept hidden for future):
- Content Planner
- AI Video Editor
- Analytics & Insights  
- AI Host Live Stream
- Generate Brand Identity
- Complex AI Content Generator tabs

## Existing Infrastructure to Keep
- `generation_requests` table (already set up)
- `generationRequestService.ts` (already works)
- `send-notification` edge function (already works)
- Admin dashboard for processing requests

## Technical Details

### Database - No Changes Needed
The existing `generation_requests` table already supports:
- User requests with prompt, type, status
- Admin can update status and upload result_url
- RLS policies already in place

### Real-time Updates
Add Supabase real-time subscription so users see status changes without refreshing:
```typescript
supabase
  .channel('generation_requests')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'generation_requests',
    filter: `user_id=eq.${userId}`
  }, handleUpdate)
  .subscribe()
```

### Mobile Layout
- History panel becomes collapsible/drawer on mobile
- Prompt box takes full width
- Bottom sheet for viewing request details

## Implementation Steps

1. Create `SimplifiedDashboard.tsx` with prompt-centered UI
2. Create `GenerationHistory.tsx` sidebar component
3. Create `RequestDetailView.tsx` for viewing results
4. Update `Dashboard.tsx` to use new components
5. Add real-time subscription for status updates
6. Test end-to-end flow
