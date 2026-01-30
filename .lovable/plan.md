

## Plan: Email Notifications & Admin Request Management System

### Overview
This plan will set up email notifications for new signups and generation requests, plus enhance the admin backend to properly view and manage all user requests in a database.

---

### Phase 1: Set Up Email Service (Resend)

**Prerequisites:**
- You'll need to create a Resend account at https://resend.com
- Validate your email domain at https://resend.com/domains
- Create an API key at https://resend.com/api-keys
- Provide me with the `RESEND_API_KEY` and your admin email address

**Create Edge Function: `send-notification`**
```
supabase/functions/send-notification/index.ts
```

This function will handle all notification types:
- `signup` - When a new user registers
- `generation_request` - When someone requests image/video generation

---

### Phase 2: Database Schema for Generation Requests

**Create new table: `generation_requests`**
```sql
CREATE TABLE public.generation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text,
  request_type text NOT NULL, -- 'video' | 'image'
  prompt text NOT NULL,
  aspect_ratio text,
  status text DEFAULT 'new', -- 'new' | 'in-progress' | 'completed' | 'failed'
  reference_image_url text,
  result_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
```

**RLS Policies:**
- Users can view their own requests
- Users can create their own requests
- Admins can view ALL requests
- Admins can update ALL requests

---

### Phase 3: Signup Notification

**Approach:** Modify the existing `handle_new_user()` database trigger or create a new trigger that calls the edge function when a user signs up.

Alternative approach: Call the notification edge function directly from the `signUp` function in `AuthContext.tsx` after successful signup.

**Email Content:**
```
Subject: New User Signup - HypeIt
Body: 
- User Name: {name}
- Email: {email}
- Signup Time: {timestamp}
```

---

### Phase 4: Generation Request Notifications

**Create a service function** to:
1. Insert the request into `generation_requests` table
2. Call the `send-notification` edge function

**Integrate with existing generators:**
- `VideoGenerator.tsx` - Add call before/after video generation
- `VisualGenerator.tsx` - Add call for image generation
- `generate-image` edge function - Add notification call

**Email Content:**
```
Subject: New Generation Request - HypeIt
Body:
- User: {name} ({email})
- Type: {video/image}
- Prompt: {prompt}
- Time: {timestamp}
```

---

### Phase 5: Enhanced Admin Backend

**Update Admin Page (`/admin`):**
1. Replace localStorage-based `ImageRequestService` with Supabase queries
2. Fetch from `generation_requests` table
3. Show all user requests with filtering by status

**Admin Features:**
- View all new/in-progress/completed requests
- Update request status
- View user details and prompt
- See reference images and results

**Admin Access Control:**
Already implemented via `useAdminRole` hook and `has_role()` function. The admin with email `putra.ekadarma@gmail.com` is already configured.

---

### Architecture Diagram

```
User Signup                     User Generation Request
     │                                    │
     ▼                                    ▼
Auth Signup                    VideoGenerator/VisualGenerator
     │                                    │
     ▼                                    ▼
handle_new_user()              Insert to generation_requests
(DB Trigger)                             │
     │                                    │
     ├──────────────────────────────────┬─┘
     │                                  │
     ▼                                  ▼
send-notification Edge Function (Resend)
     │
     ▼
Admin Email Notification
     
Admin Dashboard ◄──── Supabase Query ◄──── generation_requests table
```

---

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/send-notification/index.ts` | Create | Email notification edge function |
| `src/services/generationRequestService.ts` | Create | Service to manage DB requests |
| `src/components/admin/RequestManagementSection.tsx` | Modify | Use Supabase instead of localStorage |
| `src/contexts/AuthContext.tsx` | Modify | Call notification on signup |
| `src/components/dashboard/sections/ai-generator/VideoGenerator.tsx` | Modify | Log request to DB + notify |
| `src/components/dashboard/sections/ai-generator/VisualGenerator.tsx` | Modify | Log request to DB + notify |
| Database migration | Create | Add `generation_requests` table |

---

### Next Steps Before Implementation

1. **Please provide:**
   - Your Resend API key (`RESEND_API_KEY`)
   - The admin email address where notifications should be sent

2. **Confirm:** Should the admin email be the same as the existing admin user (`putra.ekadarma@gmail.com`)?

Once you provide these details, I can implement the full system.

