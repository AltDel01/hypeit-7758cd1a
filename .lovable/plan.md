

## The Problem

Currently "Solutions" dropdown and "Features" page overlap — both show product types/capabilities. The user wants a clear separation:

- **Solutions dropdown** → Product types users can create (from the uploaded menu image): Viral Ready Short-Form Content, Promotional Video (e.g. ads), Explainer Video (including Avatars), Podcast Video, Edit Existing Video, Audio Ad, Audio Podcast, API-Generated Content, Meditation
- **Features page** → AI editing capabilities/tools: trimming, inserting footage/B-Roll, silence certain words, language dubbing, transitions, effects, motion graphics, captions, smart resize, etc.

## Changes

### 1. Update Solutions dropdown in Navbar (`src/components/layout/Navbar.tsx`)
Replace current `solutionsItems` with the product types list (with "Viral Ready Short-Form Content" at the top):
- Viral Ready Short-Form Content
- Promotional Video (e.g. ads)
- Explainer Video (including Avatars)
- Podcast Video
- Edit Existing Video
- Audio Ad
- Audio Podcast
- API-Generated Content
- Meditation

Each item links to the dashboard or a relevant route. Also update the mobile menu to match.

### 2. Rebuild Features page content (`src/pages/Features.tsx`)
Keep the hero section but update copy to focus on AI editing capabilities. Remove `CapabilitiesGrid` (product types), keep `ToolsShowcase` but repurpose it.

### 3. Rebuild CapabilitiesGrid → AI Capabilities Grid (`src/components/features/CapabilitiesGrid.tsx`)
Replace product-type cards with AI editing capabilities:
- **Trimming & Cutting** — Intelligent auto-trim
- **B-Roll & Footage Insertion** — Auto-insert relevant footage
- **Silence Certain Words** — Auto-detect and mute/bleep words
- **Language Dubbing** — 30+ languages with lip-sync
- **Transitions & Effects** — Cinematic transitions
- **Motion Graphics** — Auto-animated text and graphics
- **AI Captions & Subtitles** — Styled, timed captions
- **Smart Resize** — Auto-reframe for all platforms

### 4. Update ToolsShowcase (`src/components/features/ToolsShowcase.tsx`)
Replace current tools with deeper dives into the key AI capabilities (the most impactful ones from above), using the alternating left-right layout to showcase each with more detail.

### 5. Update hero copy in Features page
Change badge and heading to reflect "AI Capabilities" rather than "Features & Capabilities". Something like "AI-Powered Editing Tools" with a heading about intelligent editing.

