TRUNCATE TABLE cron.job_run_details;
TRUNCATE TABLE net._http_response;

SELECT cron.schedule(
  'purge-log-tables',
  '15 3 * * *',
  $$
    DELETE FROM cron.job_run_details WHERE end_time < now() - interval '3 days';
    DELETE FROM net._http_response WHERE created < now() - interval '3 days';
  $$
);