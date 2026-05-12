## Goal

Turn the homepage prompt box into a **single multimodal conversation surface** where the user can:
1. **Brainstorm** ideas with an LLM (chat: "what kind of content should I post for a coffee brand?")
2. **Generate an image** from the same box ("ok, make me a hero shot of a latte at sunset")
3. **Generate a video** from the same box ("now animate it, 9:16, 10s")
4. Keep going in the same thread, with full context carried across turns.

No more T2V / I2V / R2V tabs, no navigation to other pages. One box, one thread, mixed outputs (text bubbles, image bubbles, video bubbles).

## How it works (UX)

```text
┌─────────────────────────────────────────┐
│  Conversation thread                    │
│  ───────────────────────                │
│  You: ideas for a coffee brand reel?    │
│  AI:  Here are 5 angles… [text]         │
│  You: make angle 2 as a 9:16 video      │
│  AI:  [video player, 9:16, 10s]         │
│  You: same scene but as a poster        │
│  AI:  [image, 1080x1350]                │
├─────────────────────────────────────────┤
│  [📎] [prompt textarea........] [Send]  │
│  Mode: Auto ▾ (Auto / Chat / Image /    │
│                Video)                   │
│  Optional: ratio · duration · quality   │
│  (only shown when Image/Video chosen    │
│  or auto-detected)                      │
└─────────────────────────────────────────┘
```

- **Mode = Auto** by default. An **intent router** (LLM) decides per turn whether the user wants to chat, generate an image, or generate a video, based on the message + any attached image.
- User can override the router by picking Chat / Image / Video manually.
- Attached image + "animate this" → I2V automatically. Attached image + "edit / restyle" → image edit. No image + "make a video of…" → T2V.
- Generation params (ratio, duration, quality) appear inline only when relevant, with sensible defaults so the user doesn't have to touch them.

## Architecture

### 1. New page-level component: `ChatComposer`

Replaces the current T2V/I2V/R2V tabbed box in `src/components/home/HeroWithEditor.tsx`.

- Renders a scrollable message list + a single composer at the bottom.
- Message types: `text`, `image`, `video`, `pending` (with progress).
- Composer: textarea, attach button, mode selector, send button, contextual params row.
- Reuses existing styling tokens; no new design system work.

### 2. New hook: `useMultimodalChat`

`src/hooks/useMultimodalChat.ts`

State:
- `messages: Message[]` (persisted in `localStorage` per session, optionally in DB later)
- `isStreaming`, `pendingGenerationId`

Actions:
- `send(text, attachments, modeOverride?)` →
  1. Append user message.
  2. Call **intent router edge function** with `{ messages, latestText, hasAttachment }` → `{ intent: 'chat' | 'image' | 'video', params: {...} }`.
  3. Branch:
     - `chat` → stream tokens from `chat` edge function (Lovable AI Gateway, `google/gemini-3-flash-preview`), append assistant text bubble token-by-token.
     - `image` → call existing `qwen-image` edge function, append `pending` bubble, swap to `image` bubble on completion.
     - `video` → call existing `wan-video` edge function with the right model (`wan2.7-t2v` / `wan2.7-i2v` / `wan2.7-r2v`), poll via `wan-video-poll`, swap `pending` → `video` on completion.

### 3. New edge function: `chat-router`

`supabase/functions/chat-router/index.ts`

- Single endpoint that does both:
  - **Intent classification** (tool-calling on Lovable AI Gateway, returns structured JSON: `{intent, prompt, ratio, duration, useAttachmentAsFirstFrame}`).
  - **Chat streaming** (when intent = chat) using SSE, same pattern as the AI Gateway chat snippet in our knowledge base.
- Always sees the full conversation history so brainstorm context carries over to generation prompts ("make angle 2 as a video" resolves correctly).
- JWT-validated; errors (429 / 402) surfaced to client with toasts.

### 4. Reuse existing generation infra

- **Image**: existing `qwen-image` edge function — no changes.
- **Video**: existing `wan-video` + `wan-video-poll` — no changes. The composer just calls them with model + params chosen by the router.
- **Credits**: existing pre-flight credit check + post-completion deduction trigger continues to apply to image/video turns. Chat turns are free (LLM router + chat are cheap; we can add a tiny credit cost later if needed).
- **Reference media**: existing `storage:product-images/...` pattern for attachments, so admin/editor view + email links keep working.

### 5. Dashboard

- Dashboard stays as history-only (per existing plan). Each generation turn still creates a `generation_requests` row, so it shows up in history exactly like today.
- Chat turns are NOT written to `generation_requests` (kept local to the thread).

### 6. Mode selector + params

- `Auto | Chat | Image | Video` segmented control under the textarea.
- When Image: show ratio + quality.
- When Video: show ratio + duration (2–15s) + quality + (if attachment) "use as first frame" toggle.
- When Auto: hidden until router decides; user can still tweak before resend.

## Files to add / change

**Add**
- `src/components/home/ChatComposer.tsx` — UI shell (thread + composer).
- `src/components/home/chat/MessageBubble.tsx` — renders text / image / video / pending.
- `src/components/home/chat/ComposerInput.tsx` — textarea + attach + mode + params.
- `src/hooks/useMultimodalChat.ts` — orchestration.
- `supabase/functions/chat-router/index.ts` — intent + chat streaming.

**Change**
- `src/components/home/HeroWithEditor.tsx` — replace the T2V/I2V/R2V tabbed box with `<ChatComposer />`. Keep marketing sections below.
- `src/services/generationRequestService.ts` — small helper so the hook can create a `generation_requests` row from an intent-routed prompt (image or video) without duplicating logic.
- `mem://dashboard/prompt-interface` — update: prompt UI is now a multimodal chat thread, not a tabbed form.

**Unchanged**
- `wan-video`, `wan-video-poll`, `qwen-image`, `send-notification`, admin/editor flows, dashboard history/projects.

## Acceptance

- Single box on `/` handles brainstorm chat, image generation, and video generation in one continuous thread.
- Auto-routing picks the right action ≥ 90% of the time on common phrasings; manual override always works.
- Attaching an image + "animate this, 9:16, 10s" produces an I2V via `wan-video` with `wan2.7-i2v`, no tab switching.
- Each image/video turn still appears in `/dashboard` history with correct credit deduction.
- Unauthenticated send still redirects to signup and resumes the thread on return.

## Open questions

1. Should chat turns be **persisted across sessions** (DB table `chat_threads` + `chat_messages`) or only kept in `localStorage` for now? Persisting enables "resume a brainstorm later" and admin visibility, but adds schema + RLS work.
2. Should chat turns **cost credits** (e.g. 1 credit/turn) or stay free to encourage brainstorming?
3. Do you want **inline editing of generated assets** in-thread (e.g. "make it warmer", "extend by 5s") routed automatically, or keep edits as a follow-up generation only?

If you want, I can default to: localStorage-only chat, free chat turns, auto-routed follow-up edits — and we revisit persistence after the UX is validated.
