
# Make Creative Workflow Functional

Today only the brand-scan step is real. Everything after it (strategy, scripts, asset generation, posting) is mock UI. This plan turns it into a working feature in phases, smallest-effort-highest-value first.

## Two important realities to decide on first

**1. TikTok auto-posting is not a quick wire-up.** The TikTok connector authenticates ONE account (the workspace owner), not each of your users. For every user to auto-post to *their own* TikTok, we need per-user TikTok OAuth + TikTok's Content Posting API, which requires submitting your app for TikTok review/approval (days to weeks, and they must approve the "direct post" scope). So Phase 4 below builds the full pipeline but real publishing only switches on after TikTok approves your app.

**2. Storing Instagram/Facebook usernames + passwords is a serious security and policy risk.** Meta's terms forbid logging into accounts with stored passwords, and a leak would expose your users' accounts. I will build it as you asked (user enters IG/FB credentials, admin can view them to post manually) but with encryption at rest and strict admin-only access. I strongly recommend later replacing this with proper Meta OAuth. This caveat is acknowledged in the build.

```text
User fills Brand Profile ─► AI brand-scan (DONE)
        │
        ▼
Generate 7-day strategy ─► AI returns concepts/hooks/scripts  ◄── Phase 1
        │
        ▼
Per-day: choose Image or Video ─► AI generates asset, deduct credits  ◄── Phase 3
        │
        ▼
Approve & schedule ─► saved to DB  ◄── Phase 2
        │
        ├─► TikTok: per-user OAuth + Content API (after approval)  ◄── Phase 4
        └─► IG/FB: user enters login ─► encrypted ─► admin dashboard posts manually  ◄── Phase 4
```

## Phase 1 — Real AI strategy + scripts
- New edge function `generate-strategy` (Lovable AI, `google/gemini-3-flash-preview`, JSON output). Input: brand name, product, brand message/tone, brand color, linked social/ecommerce channels. Output: 7 days, each with a benchmark rationale, concept, hook, body, 3 scenes (visual + voiceover), and a recommended asset type.
- Default the week to **2 videos + 3 images** (per your spec); user can change each day's asset type in the day card.
- Replace the `setTimeout` + static arrays in `handleStrategy` with a real call; keep the existing card UI.

## Phase 2 — Persistence (save to account)
New tables (with GRANTs + RLS, user owns their rows; admins can read for the dashboard):
- `creative_strategies` — one row per generated week (user_id, brand snapshot, created_at).
- `creative_days` — one row per day (strategy_id, day, status, concept, hook, body, scenes jsonb, asset_type, asset_url, platforms jsonb, scheduled_time).
Strategies reload on revisit; editing a day card updates the DB.

## Phase 3 — Real asset generation with credit deduction
- "Generate Asset" calls a new `generate-creative-asset` edge function:
  - **Image** → image generation model, stored in a `creative-assets` storage bucket.
  - **Video** → reuse the existing `generation_requests` editor-fulfillment pipeline (consistent with how the rest of the app produces video) OR a video model; the asset URL is saved on the day row.
- Credit deduction reuses your existing credit system (keyword/variable cost, deducted on completion). Each generation cuts tokens, per your spec. Pre-check balance before allowing generation.

## Phase 4 — Publishing
**TikTok (build now, live after approval):**
- Add per-user TikTok OAuth connect button. Store each user's TikTok token. Edge function `publish-tiktok` uses the Content Posting API to push the day's video at the scheduled time (a pg_cron scheduler checks due posts).
- Until your TikTok app is approved, the button + queue work but publishing stays in "Pending approval" mode.

**Instagram / Facebook (manual-by-staff):**
- New table `social_credentials` (user_id, platform, account_name, encrypted_password, status). Encrypted at rest; RLS so only the owner can write and only admins can read.
- A field in the day card / settings for the user to enter their IG/FB account name + password.
- Admin dashboard section listing submitted credentials + the ready-to-post assets so staff can post manually and mark each day "Published".

## What I'll do first
If you approve, I'll start with **Phase 1 + Phase 2** (real strategy/scripts + saving), since that's the fastest path to a genuinely working workflow, then move through Phases 3 and 4. I'll also need you to connect the TikTok connector and confirm the IG/FB password-storage approach before Phase 4.

## Technical notes
- Edge functions: `generate-strategy`, `generate-creative-asset`, `publish-tiktok`, plus a cron-driven scheduler. All use `LOVABLE_API_KEY` (already set) and return generic client errors per project rules.
- New storage bucket `creative-assets` (private, signed URLs).
- Credentials stored only encrypted; never returned to non-admin clients.
- Reuses existing credit deduction, user_roles/admin access, and the `storage:bucket/path` reference convention already in the app.
