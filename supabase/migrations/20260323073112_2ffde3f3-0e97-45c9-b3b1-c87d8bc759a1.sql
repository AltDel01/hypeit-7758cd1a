SELECT cron.schedule(
  'check-editor-sla',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://mkwinxbualpcivkujlfd.supabase.co/functions/v1/check-editor-sla',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd2lueGJ1YWxwY2l2a3VqbGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTU1MTAsImV4cCI6MjA1ODIzMTUxMH0.GK4ljHmyWStpkHWwsdLH7_22BzqNSeWSLCRSV9lWndc"}'::jsonb,
    body:='{"time": "now"}'::jsonb
  ) AS request_id;
  $$
);