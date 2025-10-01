# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Detta är en React-baserad webbplats för Storegården 7, byggd med Vite som build tool. Sidan är en single-page application som visar information om lokalen, bildgalleri med kategorier, samt kontaktinformation.

## Development Commands

```bash
# Starta development server (med HMR)
npm run dev

# Bygga för produktion
npm run build
# - Kör build:gallery (genererar galleryCategories.json från public/images/)
# - Kör build:version (genererar src/build.json med version/timestamp)
# - Kör vite build

# Linting
npm run lint

# Preview production build
npm run preview

# Deploy till GitHub Pages
npm run deploy
```

## Architecture & Key Patterns

### Build Process

Projektet har en multi-step build process:

1. **Gallery Generation** (`scripts/generate-gallery-categories.js`):
   - Skannar `public/images/` för kategorimappar (lokal, evenemang, konst-keramik)
   - Letar efter bilder med mönstret `slide{number}.jpg`
   - Genererar `src/data/galleryCategories.json` med kategori-metadata och bildnummer
   - Detta körs FÖRE varje build via `build:gallery` script

2. **Version Generation** (`build:version`):
   - Genererar `src/build.json` med version, buildTime, buildNumber
   - Används av `BuildInfo.jsx` komponenten

3. **Vite Build**:
   - Code splitting: vendor chunk (react, react-dom), gallery chunk (react-image-gallery)
   - Asset organization: js/, css/, images/ directories
   - Bundle analyzer: stats.html genereras i dist/ för bundle size-analys

### Component Structure

**App.jsx** är huvudkomponenten med sektionsbaserad layout:
- Lazy loading för tunga komponenter (ImageGallery, Vilka)
- ErrorBoundary wrappers runt kritiska sektioner
- Suspense med LoadingSpinner för lazy loaded components
- Accessibility-first: ARIA labels, skip links, semantic HTML

**ImageGallery System** (kärnfunktionalitet):
- `ImageGallery.jsx`: Huvudkomponent som läser från `galleryCategories.json`
- `CategoryToggle.jsx`: Kategoriväxlare för att filtrera bilder
- Bilderna organiseras i kategorier: lokal, evenemang, konst-keramik, alla
- Använder `react-image-gallery` för lightbox-funktionalitet
- Thumbnail grid med lazy loading för bilder utanför initial viewport
- Bilder måste finnas i `public/images/{category}/slide{number}.jpg`

**Utility Components**:
- `ErrorBoundary.jsx`: Fångar React rendering errors
- `LoadingSpinner.jsx`: Visar loading state
- `FadeInSection.jsx`: Intersection Observer-baserad fade-in animation

### Styling

- Custom CSS med CSS variables i `index.css` (:root)
- Ingen Tailwind config (trots att Tailwind är installerad)
- Jost font används genomgående
- CSS-variablerna inkluderar: colors, shadows, z-index, transitions
- Component-specifik CSS: `ImageGalleryStyles.css`, `CategoryToggle.css`

### Image Management

Bildstrukturen är kritisk:
```
public/
  images/
    lokal/
      slide1.jpg, slide3.jpg, ...
    evenemang/
      slide2.jpg, slide4.jpg, ...
    konst-keramik/
      slide16.jpg, slide18.jpg, ...
```

När nya bilder läggs till:
1. Placera dem i rätt kategorimapp med slide{number}.jpg-format
2. Kör `npm run build:gallery` för att regenerera galleryCategories.json
3. Bildnummer måste vara unika inom kategorierna för att "Alla bilder" ska fungera korrekt

### Performance Optimizations

- React.lazy() och Suspense för code splitting
- useMemo för dyr beräkning av bilddata
- useCallback för event handlers
- Lazy loading av bilder (loading="lazy" för bilder utanför initial view)
- Bundle visualization med rollup-plugin-visualizer

## Important Notes

- **Build före commit**: Galleri-ändringar kräver build för att galleryCategories.json ska uppdateras
- **Image naming**: Bildnamn måste följa `slide{number}.jpg` mönstret exakt
- **Category metadata**: Uppdateras i `scripts/generate-gallery-categories.js` CATEGORY_METADATA
- **Deployment**: Använder gh-pages för hosting, base path är '/'