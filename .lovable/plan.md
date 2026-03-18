

# Video Explainer Page for Viralin AI

Create a new `/explainer` page with an animated, auto-playing product demo that showcases the Viralin AI workflow using motion graphics built with Framer Motion and CSS animations. This page will NOT modify any existing files except adding a route in `App.tsx`.

## What it will show (auto-playing loop)

A cinematic, scroll-driven animated sequence with 4 scenes:

1. **Scene 1 — Hero Intro** (fade-in with scale): "Viralin AI" title with gradient text animation, tagline "Chat-Based AI Video Editing", particle/glow background
2. **Scene 2 — Upload**: Animated file icon drops into a mock upload zone, file name types out character-by-character
3. **Scene 3 — Chat Prompt**: A mock chat interface where a prompt auto-types ("Add captions, B-roll, and transitions. Make it 1080p 15 seconds"), then feature pills animate in one-by-one (Caption, B-roll, Transitions), a processing spinner appears
4. **Scene 4 — Result**: A mock video player "reveals" with view/like counters animating up, social platform icons appear, CTA button pulses

Each scene auto-advances after a timed delay, then the whole sequence loops.

## Technical approach

### New files
- `src/pages/Explainer.tsx` — page component with route
- `src/components/explainer/ExplainerHero.tsx` — scene orchestrator using `useState` + `useEffect` timers and CSS animations/transitions
- `src/components/explainer/scenes/IntroScene.tsx`
- `src/components/explainer/scenes/UploadScene.tsx`
- `src/components/explainer/scenes/ChatPromptScene.tsx`
- `src/components/explainer/scenes/ResultScene.tsx`

### Route addition (only existing file change)
Add to `App.tsx`:
```
<Route path="/explainer" element={<CustomErrorBoundary><Explainer /></CustomErrorBoundary>} />
```

### Animation approach
- **No new dependencies** — use CSS keyframes (already have a rich animation system) + React state-driven transitions with `transition-all duration-700` and conditional class toggling
- Typewriter effect via `useState` + `setInterval` character-by-character
- Scene transitions via opacity/transform with CSS transitions triggered by state changes
- Staggered pill animations via `animation-delay` on each element
- Counter animation via `requestAnimationFrame` number interpolation
- Background: reuse existing gradient blurs from HeroWithEditor pattern

### Design
- Full dark theme matching existing homepage (`bg-black`, `bg-gray-900`, purple/blue gradients)
- Reuse existing UI components: `Button`, gradient text styles, rounded pill buttons
- Full-screen sections, each scene occupies viewport height
- Navigation: minimal — just a back-to-home link and the scene indicator dots

