UPDATE public.generation_requests
SET stale_notified_at = now()
WHERE status = 'new'
  AND assigned_to IS NULL
  AND stale_notified_at IS NULL
  AND created_at < (now() - interval '30 minutes')