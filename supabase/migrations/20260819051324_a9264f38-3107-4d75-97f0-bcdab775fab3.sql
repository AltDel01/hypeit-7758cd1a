UPDATE public.generation_requests
SET category = 'video-t2v',
    auto_provider = 'wan',
    auto_model = 'wan2.7-t2v',
    auto_failed = true,
    failure_reason = 'This video was never submitted to the provider. Press Try again to generate it now.'
WHERE id = 'f6215cd9-5b98-4f73-91c1-8520dbd9845c'
  AND result_url IS NULL;