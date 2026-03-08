

# Features Page Plan

## Overview
Build a new `/features` page combining **product capabilities** (what users can create) at the top and **platform tools/features** below. Dark theme consistent with homepage and enterprise page.

## Page Structure

### 1. Hero Section
- Minimal hero with heading: "Create Content That Goes Viral"
- Subheading about the platform's AI-powered capabilities
- CTA buttons: "Get Started Free" + "Watch Demo"

### 2. Product Capabilities Grid (top section)
Card grid showcasing what users can create, in this order:

1. **Viral Ready Short-Form Content** — AI-optimized clips for TikTok, Reels, Shorts
2. **Promotional Videos** — Brand ads, product launches, campaigns
3. **Explainer Videos** — How-to content, tutorials, walkthroughs
4. **Podcasts** — AI-generated podcast content with avatars
5. **AI Avatars / UGC** — Photorealistic talking avatars for brand content
6. **Product Visuals** — E-commerce images and videos that convert

Each card: icon, title, short description, gradient accent, and a relevant image/visual. Style similar to the reference image (dark cards with imagery).

### 3. Platform Tools/Features Section
Alternating left-right layout (reusing CoreFeatures pattern) showcasing the underlying tools:

- **AI Video Editor** — Cinematic transitions, motion graphics, auto-editing
- **Viral Clip Extractor** — Find golden moments from long-form content
- **AI Captions & Subtitles** — Auto-generated, styled captions
- **Multi-Language Dubbing** — Translate and dub in 30+ languages
- **Smart Resize** — One-click format adaptation for all platforms
- **Brand Kit** — Consistent branding across all generated content

### 4. Bottom CTA
"Ready to create?" section with signup button.

## Technical Details

### Files to create/modify:
- **`src/pages/Features.tsx`** — Main features page
- **`src/components/features/CapabilitiesGrid.tsx`** — Product capabilities card grid
- **`src/components/features/ToolsShowcase.tsx`** — Platform tools alternating layout
- **`src/App.tsx`** — Add `/features` route

### Design approach:
- Dark background (`bg-black`) matching homepage
- Purple gradient accents consistent with brand
- Responsive: 1-col mobile, 2-col tablet, 3-col desktop for capabilities grid
- Reuse existing UI components (`Button`, gradients, badge pills)
- Navbar already has `/features` link wired up

