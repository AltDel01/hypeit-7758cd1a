# AI B-Roll Video Editor (Gemini + Veo)

## Answer first: the API question

There is no model called "Google Omni" in the Lovable AI Gateway catalog. What the tutorial calls the "Gemini Omni Video Editor" is not one API, it is a pipeline: a multimodal Gemini model watches the video and returns timestamped edit decisions, a video model generates the b-roll clips, and a compositor burns them in.

Both halves are available to this project today:

- Understanding / edit planning: Gemini chat models through the Lovable AI Gateway (already used by the app for strategy, trends, ad copy).
- B-roll generation: the gateway `/v1/videos` endpoint with `google/veo-3.1-lite` / `veo-3.1-fast` / `veo-3.1` (8s max per clip, 720p/1080p, 16:9 or 9:16). Alibaba Wan (already wired in this app) is the alternative for longer or cheaper clips.

So yes, this is buildable. The only piece the gateway does not give us is the actual video compositing, we have to do that ourselves.

## How it will work

```text
1. User uploads video in Dashboard > AI Video Editor > B-roll
2. Browser extracts audio + sample frames (every ~2s) from the video
3. Gemini receives frames + transcript -> returns an Edit Decision List:
     [{ start: 12.4, end: 16.0, reason: "explains the 3-step method",
        brollPrompt: "close-up hands stacking wooden blocks, soft light",
        overlayText: "STEP 3" }, ...]
4. User reviews / edits / removes the proposed b-roll moments
5. On confirm: for each accepted moment, a Veo job generates the clip
6. Browser composites the clips + text overlays onto the source video
7. Result saved to storage, logged in generation history, downloadable
```

Step 3 answers your question directly: yes, the AI picks which parts are interesting. It scores each segment on hook strength, whether the speaker is describing something visual, and dead air, then only proposes b-roll where cutaway helps.

## Compositing (the one hard part)

Edge functions cannot run ffmpeg, so full automation happens in the browser with `ffmpeg.wasm`:

- Overlay or cutaway insertion, text callouts, fades, original audio preserved.
- Practical ceiling: source videos up to roughly 3 minutes / 200 MB. Longer files get routed to the existing human editor queue with the AI plan attached, so nothing dead-ends.

## Cost and limits to be aware of

- Each b-roll clip is a separate Veo job (~1 to 3 minutes each, jobs run sequentially, not in parallel, because of gateway concurrency limits). A 60s video with 4 b-roll inserts means 4 jobs.
- Video generation is by far the most expensive AI call in the app, so it runs only after the user explicitly approves the plan, never automatically.
- Credits get deducted through the existing variable credit system, priced per accepted b-roll clip.

## Build phases

1. **Analysis only** - upload, frame sampling, Gemini edit-decision list, review UI showing proposed b-roll moments with timestamps. No generation yet, cheap to validate.
2. **Generation** - `broll-generate` edge function creating and polling Veo jobs, clips stored in Supabase Storage, per-clip regenerate.
3. **Compositing** - ffmpeg.wasm assembly in the browser, preview, export, save to history, fallback to editor queue for long videos.
4. **Elements** - text callouts, arrows, stickers, emoji overlays placed at the AI-suggested timestamps.

## Technical notes

- New edge functions: `broll-plan` (Gemini analysis, structured JSON output) and `broll-generate` (create + poll `/v1/videos`, download MP4, upload to a private bucket, return signed URL).
- Frame sampling and transcript extraction happen client-side to keep payloads small; only frames plus a transcript go to Gemini, not the raw video.
- New table `broll_jobs` (user_id, source_video_path, plan jsonb, status, clips jsonb) with owner-scoped RLS and explicit grants; every job also logged into `generation_requests` so it appears in existing history and email flows.
- Aspect ratio for b-roll matches the source video orientation (9:16 for vertical), clips capped at 8s each per Veo limits.
- Reuses the existing credit deduction on completion, not on submit.

## Scope decisions still open

- B-roll source: AI-generated (Veo) confirmed. Stock library and user-uploaded b-roll can be added later as extra sources in the same review UI.
- Creative Workflow integration is out of scope for now, this ships in the AI Video Editor tab only.
