

## Hide Tech Stack from Public Detection

**What**: Reduce the fingerprint that tools like BuiltWith and browser DevTools can use to identify the technology stack (React, Vite, Supabase, Radix UI, etc.).

### What's Currently Detectable

1. **`<meta name="generator" content="Website Builder">`** in `index.html` — signals a builder platform
2. **`<div id="root">`** — classic React SPA fingerprint
3. **Vite chunk naming** — default output files like `index-[hash].js` reveal Vite
4. **Radix UI data attributes** — components emit `data-radix-*`, `data-state`, etc. in the DOM
5. **Supabase client** — network requests to `*.supabase.co` are visible in DevTools
6. **`gptengineer.js` script** — loaded from `cdn.gpteng.co` (cannot be removed per project rules)
7. **React DevTools detection** — React exposes `__REACT_DEVTOOLS_*` globals in dev builds

### What We Can Do (realistic scope)

| Change | Impact |
|--------|--------|
| Remove `<meta name="generator">` tag | Hides builder signal from BuiltWith |
| Rename `<div id="root">` to a custom ID like `<div id="app">` | Less obvious React fingerprint |
| Customize Vite chunk file names via `build.rollupOptions.output` | Removes Vite naming patterns |
| Strip Radix `data-*` attributes in production (via a Vite plugin) | Removes UI library fingerprint |

### What We Cannot Fully Hide

- **Supabase API calls** — network requests to `*.supabase.co` will always be visible; a proxy would require a custom backend
- **`gptengineer.js`** — must not be removed per project rules
- **React runtime behavior** — a determined analyst can still identify React from bundle patterns; full obfuscation is impractical

### Changes

**1. `index.html`**
- Remove `<meta name="generator" content="Website Builder" />`
- Change `<div id="root">` to `<div id="app">`

**2. `src/main.tsx`**
- Update `getElementById('root')` to `getElementById('app')`

**3. `vite.config.ts`**
- Add `build.rollupOptions.output` to randomize chunk/asset names:
  ```
  chunkFileNames: 'assets/[hash].js'
  assetFileNames: 'assets/[hash][extname]'
  entryFileNames: 'assets/[hash].js'
  ```

**4. Optionally**: Add a small Vite plugin or PostCSS plugin to strip `data-radix-*` attributes from production HTML — though this risks breaking Radix component behavior, so I'd recommend skipping this one unless you're comfortable with potential side effects.

### Summary
4 small edits across 3 files. This won't make the stack completely invisible to a determined analyst, but it removes the easy fingerprints that automated scanners like BuiltWith pick up.

