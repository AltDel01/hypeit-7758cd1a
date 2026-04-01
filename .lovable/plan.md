

## Fix: Default Parameters Appearing in Prompts

### Problem
There are **three code paths** in `SimplifiedDashboard.tsx` that build the prompt string when submitting a generation request. Two of them correctly only append Aspect/Resolution/Duration/Timeline when the user explicitly selects a value. But **one code path** (the auto-submit/redirect path around line 339-344) unconditionally appends all parameters with "Default" as fallback, causing them to always appear in emails and dashboards.

### Root Cause
Lines 339-344:
```ts
const aspectRatio = savedState?.selectedAspectRatio || 'Default';  // <-- always "Default"
const resolution = savedState?.selectedResolution || 'Default';
const duration = savedState?.selectedDuration || 'Default';
fullPrompt += ` | Aspect: ${aspectRatio} | Resolution: ${resolution} | Duration: ${duration} | Timeline: ${start}-${end}`;
```

This always appends all four fields. The other two submit paths correctly do:
```ts
if (selectedAspectRatio) fullPrompt += ` | Aspect: ${selectedAspectRatio}`;
```

### Fix
**1 file, 1 edit** in `src/components/dashboard/SimplifiedDashboard.tsx`:

Replace lines 339-344 with conditional appending, matching the pattern used in the other two code paths:

```ts
if (savedState?.selectedAspectRatio) fullPrompt += ` | Aspect: ${savedState.selectedAspectRatio}`;
if (savedState?.selectedResolution) fullPrompt += ` | Resolution: ${savedState.selectedResolution}`;
if (savedState?.selectedDuration) fullPrompt += ` | Duration: ${savedState.selectedDuration}`;
const start = savedState?.startTimestamp || '00:00';
const end = savedState?.endTimestamp || '00:00';
if (start !== '00:00' || end !== '00:00') fullPrompt += ` | Timeline: ${start}-${end}`;
```

This ensures all three submission paths behave identically: parameters only appear when the user explicitly selects them.

