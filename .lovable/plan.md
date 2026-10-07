# Real social account connection and auto-posting for Creative Workflow

## How it works today (honest status)
- The "Social Media Links" fields in Brand Profile are only web addresses. They are used to scan your brand tone and color. They do not log in to anyone's account.
- The "Post" button on each Day card only marks the day as "Published" in Viralin. Nothing is actually sent to TikTok, Instagram, or Facebook yet.

## What we will build
1. **"Connected Accounts" panel** in Creative Workflow (and in Settings): three buttons, "Connect TikTok", "Connect Instagram", "Connect Facebook". Each opens the official TikTok or Meta login popup, the user approves, and the panel shows the account name, avatar, and a Disconnect button.
2. **Real posting**: "Post" sends the generated video/image plus caption to the selected platforms. The card shows Posting, Posted (with a link to the live post), or Failed (simple message plus Retry).
3. **Scheduling**: each Day card gets a date/time. A background job posts automatically at that time, even if the user is offline.
4. **Posting History** page shows real statuses: Queued, Posting, Posted, Failed, with links.
5. Day platform toggles are disabled with a "Connect first" hint when that account is not connected.

## What you need to provide (blockers)
- **TikTok**: a TikTok for Developers app with "Login Kit" and "Content Posting API". You send me Client Key and Client Secret. Until TikTok approves the app (audit), posts go out as private/"Only me" drafts.
- **Meta (Instagram + Facebook)**: a Meta Developer app (type Business) with Facebook Login. You send me App ID and App Secret. Permissions needed: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `business_management`. Requires Meta App Review and Business Verification before the public can use it; until then only accounts added as testers work.
- Users' Instagram must be a Business/Creator account linked to a Facebook Page (Meta rule).
- Redirect URLs to register in both apps: `https://viralin.ai/oauth/tiktok/callback` and `https://viralin.ai/oauth/meta/callback`.

## Technical details
- Tables: `social_connections` (user_id, platform, account_id, account_name, avatar, encrypted access/refresh tokens, expires_at, page_id / ig_user_id) with service-role-only access; extend `creative_posts` with `scheduled_at`, `external_post_id`, `external_url`, `post_error`.
- Edge functions (JWT-validated, generic client errors): `social-oauth-start`, `social-oauth-callback` (code exchange, AES-GCM token encryption), `social-disconnect`, `social-publish` (TikTok Content Posting API `video/init` with PULL_FROM_URL; Instagram `/{ig-user-id}/media` + `media_publish` for Reels/images; Facebook Page `/videos` or `/photos`), `social-publish-cron` (pg_cron every minute for scheduled posts, token refresh, status polling).
- Media served via signed URLs from storage so platforms can pull the file.
- Frontend: popup-based OAuth (works inside preview), `ConnectedAccounts` component, `handlePost` in `CreativeWorkflow.tsx` replaced with the real call.
- Secrets: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `META_APP_ID`, `META_APP_SECRET`, `SOCIAL_TOKEN_SECRET`.

## Order
1. Build the connect panel, tables, and functions (ready to go as soon as keys arrive).
2. Add secrets when you provide them, test with your own accounts.
3. Real posting + scheduling + history statuses.
