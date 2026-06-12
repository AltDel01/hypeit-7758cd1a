create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('wan-video-poll-cron') where exists (select 1 from cron.job where jobname = 'wan-video-poll-cron');

select cron.schedule(
  'wan-video-poll-cron',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/wan-video-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);