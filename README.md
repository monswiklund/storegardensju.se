# Storegården 7

Modern SPA for Storegården 7 – showcasing the venue, events, courses and image gallery.

## Tech Stack
- **Vite** + **React 18**
- **GSAP + Lenis** for smooth scrolling and parallax (auto-disabled for reduced-motion users)
- **react-router-dom** for client-side routing
- **react-masonry-css** (+ custom lightbox coming soon) for the gallery
- **ESLint flat config** for linting

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Key Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server (Vite + HMR) |
| `npm run build:gallery` | Scan `public/images/gallery` and regenerate `src/data/galleryCategories.json` |
| `npm run build:version` | Stamp `src/build.json` with version + timestamp |
| `npm run build` | Generate gallery metadata, embed build info, and bundle for production |
| `npm run lint` | Run ESLint across the project |
| `npm run optimize-images` | Optimise `public/images/**` into `public/images-optimized` (requires `npm i -D sharp`) |
| `npm run deploy` | Publish `dist/` to GitHub Pages (`gh-pages` branch) |

The gallery generator expects filenames formatted as `{kategori}-{subkategori}-{nummer}.webp` (see `scripts/generate-gallery-categories.js` for supported keys).

## Content Updates
- Homepage/service/event copy lives in `src/data/homeContent.js`.
- Contact channels and CTA copy live in `src/data/contact.js`.
- Team member bios and contact details live in `src/data/profileData.js`.
- Gallery images should be placed in `public/images/gallery/`, then run `npm run build:gallery` to refresh metadata.
- Optional: run `npm run optimize-images` to generate compressed copies under `public/images-optimized/` (requires installing `sharp` once).

## Project Layout

```
src/
  App.jsx
  data/                 # Content/config data
  features/             # Feature-oriented UI modules
    contact/
    creation/
    events/
    gallery/
    home/
    team/
    venue/
  layout/PageSection/
  components/           # Cross-cutting UI (navbar, scroll utilities, errors, etc.)
  hooks/
  pages/                # Route compositions
```

See `docs/architecture.md` for a deeper breakdown of data flow, tooling and deployment.

## Deployment
1. Update content/images as needed.
2. Run `npm run build`.
3. Review `dist/stats.html` if you want bundle insight.
4. Deploy via `npm run deploy` (publishes to GitHub Pages).

## Accessibility & Performance Notes
- Smooth scrolling toggles off when `prefers-reduced-motion` is enabled.
- Gallery lazily loads categories and uses masonry layout for responsive grids.
- Footer build info (`src/components/ui/BuildInfo.jsx`) exposes version + build timestamp for release verification.
