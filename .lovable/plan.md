# Remove the cursor-following light / shifting background

## What changes
- The purple-blue glow that moves with the mouse and changes color will be removed everywhere it appears (Virality, Brand Identity, Analytics, and the admin/editor request workspaces).
- Those pages keep the normal plain dark background. All content and layout stay the same.
- The hover shine on the homepage showcase cards (HoloCard) is left as is unless you want it removed too.

## Technical details
- Rewrite `src/components/effects/AuroraBackground.tsx` into a plain wrapper (`relative min-h-screen w-full bg-background`) with no mousemove listener and no gradient layer. All pages using it get the fix with no edits to each page.
