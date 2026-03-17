

# Ensure Credit Changes Work End-to-End (Homepage → Dashboard)

## Current State
The credit calculation with prompt-based detection is already integrated into all 4 `calculateCreditCost` call sites in `SimplifiedDashboard.tsx`. The homepage saves prompt text, features, resolution, duration, and mode via `saveEditorState`, and the dashboard loads and uses all of these when calculating costs. **The flow is already connected.**

## One Issue Found
In `src/services/generationRequestService.ts` line 54, there's a **fallback of 10 credits**:
```ts
const creditsUsed = params.creditsUsed || 10;
```
If for any reason `creditsUsed` isn't passed (edge case), it would fall back to the old 10-credit charge. This should be updated to **50** to match the new minimum video floor.

Also, the default remaining credits fallback on line 57 is `25`, which may be too low now that minimum costs are 50.

## Changes

### 1. Update `src/services/generationRequestService.ts`
- Line 54: Change fallback from `10` to `50` — `const creditsUsed = params.creditsUsed || 50;`
- Line 57: Update remaining credits fallback from `25` to `500` to match the current free tier allocation

### 2. No other changes needed
All 4 `calculateCreditCost` call sites already pass `prompt` (the raw user text) and `requestType: 'video'`, so prompt-based keyword detection and the new base costs are already active for:
- Special mode auto-submit (homepage → dashboard with AI Clip/Retention/Creator)
- Standard prompt auto-submit (homepage → dashboard)
- Special mode manual submit (dashboard)
- Standard prompt manual submit (dashboard)

