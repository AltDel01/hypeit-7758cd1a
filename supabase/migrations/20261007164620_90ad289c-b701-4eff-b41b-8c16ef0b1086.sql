-- lovable-cron-fallback-reviewed: social platforms have no "publish at time" callback for our queue; 5-minute sweep only acts on due scheduled posts
CREATE TABLE public.social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform IN ('tiktok','instagram','facebook')),
  account_id text NOT NULL,
  account_name text,
  avatar_url text,
  access_token_ciphertext text NOT NULL,
  refresh_token_ciphertext text,
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  page_id text,
  ig_user_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_connections TO service_role;

CREATE TABLE public.social_oauth_states (
  state text PRIMARY KEY,
  user_id uuid NOT NULL,
  provider text NOT NULL CHECK (provider IN ('tiktok','meta')),
  redirect_uri text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.social_oauth_states ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_oauth_states TO service_role;

ALTER TABLE public.creative_posts
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS publish_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS post_error text;

CREATE INDEX IF NOT EXISTS creative_posts_scheduled_idx ON public.creative_posts (scheduled_at) WHERE status = 'scheduled';

select cron.unschedule('social-publish-cron') where exists (select 1 from cron.job where jobname = 'social-publish-cron');
select cron.schedule(
  'social-publish-cron',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/social-publish-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);