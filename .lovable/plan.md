# Fix: two lip-sync video requests stuck on "Processing"

## What happened

Both stuck requests (from quinnofspicy@gmail.com, 13:39 and 15:04 today) are lip-sync jobs: two attached photos plus an audio/voice file. They were classified as `video-lipsync`, but they were never submitted to Alibaba DashScope — both rows still have no provider task id, and there are no invocation logs for the lip-sync function at all.

Cause: for a lip-sync job the app only sends a "portrait image" when the user explicitly sets a first frame. Here the photos were sent as plain attachments, so the portrait field was empty. The lip-sync edge function rejects that request up front ("Portrait mode requires portraitUrl") and returns before it flags the job as failed. The row therefore stays in the `new` state forever, and the dashboard shows "Processing" indefinitely. The server-side finalizer cron only rescues jobs that already have a provider task id, so it never touched these.

This is not an API outage: other video jobs from the same user today (i2v and r2v) completed normally.

## Fix

1. **Send the portrait image for lip-sync jobs** (`src/hooks/useMultimodalChat.ts`)
   Fall back to the first attached image as the portrait when no explicit first frame is set, so image + audio submissions reach DashScope.

2. **Use the correct model per mode** (`src/config/generationCategories.ts` / lip-sync function)
   Portrait mode (image + audio) must record `emo-v1`, video mode (video + audio) `videoretalk`. Today both are stored as `videoretalk` at insert time, which is misleading in history and email.

3. **Never leave a request silently hanging** (`supabase/functions/dashscope-lipsync/index.ts`)
   Every early validation return (missing audio, missing portrait, missing source video, unresolvable storage URL) must mark the request `auto_failed = true` with a `failure_reason` before returning, so it drops into the editor queue and the user sees a real status instead of endless "Processing".

4. **Safety net in the cron** (`supabase/functions/wan-video-cron/index.ts`)
   Any request with an auto provider that is still `new`, has no provider task id, and is older than 15 minutes gets marked `auto_failed = true` so it is routed to a human editor. This catches any future dispatch that fails before submission.

5. **Recover the two current requests**
   Re-dispatch them with the corrected portrait handling; if DashScope rejects them, mark them for the editor queue so the user gets a result rather than a spinner.

## Technical notes

- Lip-sync submits to `image2video/video-synthesis`; `emo-v1` takes `image_url` + `audio_url`, `videoretalk` takes `video_url` + `audio_url`. Both photos cannot be used at once, the first attachment becomes the portrait.
- Polling and result download are unchanged, `wan-video-poll` takes over once a task id exists.
