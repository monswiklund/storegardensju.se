# Storegården 7 – Architecture Overview

## Project Layout

```
src/
  App.jsx                  # Routing + global providers
  data/                    # Content & configuration used by UI components
  features/                # Feature-oriented UI modules (home, gallery, events…)
    contact/               # Contact section
    creation/              # Art/creation landing content
    events/                # Event page hero + sections
    gallery/               # Gallery/lightbox experience
    home/                  # Homepage hero/cards/events
    team/                  # Team profile showcase
    venue/                 # Shared "Om platsen" intro
  layout/PageSection/      # Reusable section wrapper
  components/              # Cross-feature primitives (navigation, ui helpers)
  hooks/                   # Custom hooks (Lenis/parallax helpers)
  pages/                   # Route components that compose features
```

### Content & Data
- `src/data/homeContent.js` centralises hero copy, services, events, venue highlights and creation offerings.
- `src/data/contact.js` keeps contact channels and CTA copy in one place.
- `src/data/galleryCategories.json` is generated via `npm run build:gallery` (`scripts/generate-gallery-categories.js`) by scanning `public/images/gallery`.
- Team member data lives in `src/data/profileData.js` and feeds the profile showcase cards.

### Styling
- Features collocate their CSS next to JSX for easy maintenance.
- Global tokens, fonts and resets live in `src/index.css`.

## Build & Tooling

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Generate gallery metadata, embed build info, and create production bundle |
| `npm run build:gallery` | Scan `public/images/gallery` and regenerate `galleryCategories.json` |
| `npm run build:version` | Stamp `src/build.json` with version/timestamp |
| `npm run lint` | ESLint (flat config) for `*.js`/`*.jsx` |
| `npm run optimize-images` | Optimise `public/images/**` → `public/images-optimized/` (requires `npm i -D sharp`) |

### Build Outputs
- Production bundle emitted to `dist/`
- Rollup visualizer written to `dist/stats.html`
- SPA deployed to GitHub Pages via `npm run deploy` (uses `gh-pages`)

## Deployment Workflow
1. Update content/data under `src/data/`.
2. Run `npm run build` to regenerate gallery metadata and build info.
3. Inspect the bundle with `dist/stats.html` if needed.
4. Deploy with `npm run deploy` (pushes `dist/` to `gh-pages` branch via `gh-pages` package).

## Environment & Requirements
- Node.js ≥ 20.x
- npm ≥ 10.x
- Images placed in `public/images/gallery` must follow `{kategori}-{subcategory}-{number}.webp` naming (see generator script for supported keys).
- Smooth-scrolling (Lenis + GSAP) automatically disables when `prefers-reduced-motion` is enabled.
- Optional: install `sharp` (`npm i -D sharp`) before running `npm run optimize-images`.

## Testing
- Playwright configuration exists under `playwright.config.js`; add tests to `tests/` and run via `npx playwright test`.

## Monitoring & Error Handling
- `src/components/ui/ErrorBoundary.jsx` wraps volatile sections (gallery, team) and surfaces a graceful fallback.
- `src/components/ui/BuildInfo.jsx` renders version/build metadata in the footer for quick release verification.
