# Remove "Auto" mode, require explicit choice

## Why
The stuck/wrong-result case happened because the brainstorm prompt was forced into video generation. Removing "Auto" eliminates guesswork: the user always picks what they want (Chat, Image, or Video) before sending. This matches how most tools behave and avoids wasted credits from misrouting.

## Plan

### 1. Remove Auto from mode options (frontend)
In `src/components/home/ChatComposer.tsx`:
- Remove the `{ id: 'auto', label: 'Auto', icon: Wand2 }` entry from `modeOptions`.
- Change the default mode from `'auto'` to `'chat'` (`useState<ChatMode>('chat')`).
- Update the localStorage draft restore so a stored `'auto'` mode falls back to `'chat'`.
- The remaining buttons become: **Chat**, **Image**, **Video**. Image/Video option panels already show when selected.

### 2. Drop the routing path (hook)
In `src/hooks/useMultimodalChat.ts`:
- Remove the `modeOverride === 'auto'` branch that calls `chat-router` in `route` mode. Intent is now always the selected mode (`chat` | `image` | `video`).
- Keep the existing media-based overrides (keyframes force video, mask forces image) as safety, but they only apply within image/video flows.
- `ChatMode` type: remove `'auto'` so the compiler enforces it everywhere.

### 3. Edge function cleanup (optional, low risk)
`chat-router` still serves streaming chat for Chat mode, so keep it. The `route` mode branch becomes unused; leave it in place (harmless) or remove it. Recommendation: leave it to avoid touching a deployed function unnecessarily.

### 4. Copy / UX
- Make sure one mode is always visibly active (Chat by default) so the user understands they are choosing an action.
- No change to credit logic or DB.

## Technical details
- `ChatMode` is defined in `useMultimodalChat.ts` (`'auto' | 'chat' | 'image' | 'video'`) → becomes `'chat' | 'image' | 'video'`.
- Search for any other references to `'auto'` mode across the codebase and update them (e.g. default props, stored drafts).

## Out of scope
- No DB schema or credit changes.
- The already-completed request is not changed retroactively.
