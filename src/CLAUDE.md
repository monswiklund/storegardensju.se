# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Detta är en React-baserad webbplats för Storegården 7 (storegardensju.se), byggd med Vite och React Router. Projektet är organiserat som en multi-page application med routing för olika sektioner: hem, event, konst & keramik, galleri, och team.

## Development Commands

```bash
# Starta development server (med HMR på port 5173)
npm run dev

# Bygga för produktion
npm run build
# Kör i ordning:
# 1. build:gallery - genererar galleryCategories.json från public/images/
# 2. build:version - genererar src/build.json med version/timestamp
# 3. vite build - bygger produktionsbundle

# Linting
npm run lint

# Preview production build
npm run preview

# End-to-end testing
npx playwright test
# Kör Playwright tests (startar dev server automatiskt)

# Deploy till GitHub Pages
npm run deploy
# Kör predeploy (build) + gh-pages deploy
```

## Architecture & Key Patterns

### Routing Structure

Projektet använder React Router v7 med BrowserRouter:

- **App.jsx**: Root router med layout och shared components
- **Pages** (`src/pages/`): Separata page components för varje route
  - `/` - HomePage (hero, featured gallery, kommande evenemang)
  - `/event` - EventPage (event-fokuserad vy)
  - `/konst` - ArtPage (konst & keramik)
  - `/galleri` - GalleriPage (fullständigt bildgalleri)
  - `/om-oss` - TeamPage (teammedlemmar)
- **Shared Components**: Navbar, footer med BuildInfo, ScrollToTopButton visas på alla sidor

Viktigt: Vite dev server är konfigurerad med `historyApiFallback: true` för client-side routing.

### Build Process

Projektet har en **critical multi-step build process** som måste köras i rätt ordning:

1. **Gallery Generation** (`scripts/generate-gallery-categories.js`):
   - Skannar `public/images/` för kategorimappar (lokal, evenemang, konst-keramik)
   - Letar efter bilder med mönstret `slide{number}.jpg`
   - Genererar `src/data/galleryCategories.json` med kategori-metadata och bildnummer
   - Detta körs **före varje build** via `build:gallery` script
   - **Breaking change risk**: Om gallery generation misslyckas, kommer galleriet inte fungera i produktion

2. **Version Generation** (`build:version`):
   - Genererar `src/build.json` med version (från package.json), buildTime, buildNumber
   - Används av BuildInfo.jsx komponenten i footer

3. **Vite Build**:
   - Code splitting: `vendor` chunk (react, react-dom, react-router-dom), `gallery` chunk (react-image-gallery)
   - Asset organization: `js/`, `css/`, `images/` directories
   - Bundle analyzer: `dist/stats.html` genereras för bundle size-analys (rollup-plugin-visualizer)

### Component Structure

**App.jsx** är root komponenten:
- BrowserRouter setup med Routes
- Shared layout: Navbar (top), footer med BuildInfo (bottom)
- ScrollToTop component för automatisk scroll till top vid route change
- ScrollToTopButton för manuell scroll

**Page Components** (`src/pages/`):
- HomePage.jsx: Hero section, FeaturedGallery, Services, UpcomingEvents
- EventPage.jsx: Event-fokuserad vy
- ArtPage.jsx: Konst & keramik showcase
- GalleriPage.jsx: Fullständigt bildgalleri med ImageGallery component
- TeamPage.jsx: Team member cards

**ImageGallery System** (kärnfunktionalitet):
- `ImageGallery/ImageGallery.jsx`: Huvudkomponent som läser från `galleryCategories.json`
- `CategoryToggle/CategoryToggle.jsx`: Kategoriväxlare för att filtrera bilder
- `FeaturedGallery/FeaturedGallery.jsx`: Featured gallery för homepage
- Bilderna organiseras i kategorier: lokal, evenemang, konst-keramik, alla
- Använder `react-image-gallery` för lightbox-funktionalitet
- Thumbnail grid med lazy loading
- **Critical path**: Bilder måste finnas i `public/images/{category}/slide{number}.jpg`

**Layout Components**:
- `layout/Navigation/Navbar.jsx`: Site navigation med routing links
- `layout/ScrollToTop/ScrollToTop.jsx`: Scrollar till top vid route change
- `layout/ScrollToTop/ScrollToTopButton.jsx`: Floating button för scroll to top

**Section Components** (`components/sections/`):
- `PageSection/PageSection.jsx`: Reusable section wrapper med background/spacing variants
- `Services/Services.jsx`: Services grid
- `Contact/Contact.jsx`: Contact section (används i footer)
- `Creation/Creation.jsx`: Creation showcase
- `ValueProposition/ValueProposition.jsx`: Value proposition section

**Hero Components** (`components/hero/`):
- `WelcomeImage.jsx`: Hero image
- `WelcomeText.jsx`: Hero text
- `ParallaxHero/ParallaxHero.jsx`: Parallax hero section
- `StickyImageSection/StickyImageSection.jsx`: Sticky scroll image section

**Event Components** (`components/events/`):
- `UpcomingEvents.jsx`: Visar upcoming events på homepage
- `EventParty/EventParty.jsx`: Event showcase component
- `PastEvents.jsx`: Past events showcase

**About Components** (`components/about/`):
- `TeamMemberProfile.jsx`: Team member card
- `ProfileShowcase/ProfileShowcase.jsx`: Profile showcase component
- `Who/Who.jsx`: Who section

**Utility Components** (`components/ui/`):
- `ErrorBoundary.jsx`: Fångar React rendering errors
- `LoadingSpinner.jsx`: Visar loading state
- `FadeInSection.jsx`: Intersection Observer-baserad fade-in animation
- `FadeInSectionOnScroll.jsx`: Alternative fade-in implementation
- `BuildInfo.jsx`: Visar version och build timestamp i footer

### Styling Approach

- **Custom CSS** med CSS variables i `index.css` (:root)
- **Tailwind CSS** är installerad men används **inte** (ingen tailwind.config.js)
- **CSS-variablerna** inkluderar: colors, shadows, z-index, transitions, backgrounds
- **Font**: Jost används genomgående (imported från Google Fonts)
- **Component-specifik CSS**:
  - Varje komponent har sin egen CSS-fil i samma mapp
  - Exempel: `ImageGallery/ImageGalleryStyles.css`, `CategoryToggle/CategoryToggle.css`
  - Section components: `PageSectionStyles.css`, `ServicesStyles.css`, etc.

### Image Management (Critical)

Bildstrukturen är **absolut kritisk** för att galleriet ska fungera:

```
public/
  images/
    lokal/
      slide1.jpg, slide3.jpg, slide5.jpg, ...
    evenemang/
      slide2.jpg, slide4.jpg, slide6.jpg, ...
    konst-keramik/
      slide16.jpg, slide18.jpg, ...
```

**När nya bilder läggs till**:
1. Placera dem i rätt kategorimapp med `slide{number}.jpg`-format (siffran måste vara unik)
2. Kör `npm run build:gallery` för att regenerera `galleryCategories.json`
3. Verifiera att `src/data/galleryCategories.json` uppdaterades korrekt
4. **Breaking change risk**: Fel bildnamn (ej slide{number}.jpg) kommer ignoreras av gallery generator

**Metadata för kategorier**: Definieras i `scripts/generate-gallery-categories.js` i `CATEGORY_METADATA` objektet.

### Performance Optimizations

- useMemo för dyr beräkning av bilddata i gallery components
- useCallback för event handlers
- Lazy loading av bilder (`loading="lazy"` för bilder utanför initial viewport)
- Bundle visualization med rollup-plugin-visualizer
- Manual chunks i Vite för vendor/gallery separation
- Code splitting för vendor libraries (react, react-dom, react-router-dom)

### Testing

- **Playwright** konfigurerad för E2E testing (`playwright.config.js`)
- Base URL: `http://localhost:5173` (dev server)
- Test directory: `./tests`
- WebServer auto-start: Playwright startar dev server automatiskt
- Reports: HTML reports genereras i `playwright-report/`

### Code Quality

- **ESLint** konfigurerad med:
  - React plugin
  - React Hooks rules
  - React Refresh plugin
  - ES2020+ syntax support
- Kör `npm run lint` före commits

## Important Notes & Breaking Changes

- **Build före commit**: Galleri-ändringar kräver `npm run build:gallery` för att `galleryCategories.json` ska uppdateras
- **Image naming är strict**: Bildnamn måste följa `slide{number}.jpg` mönstret **exakt** (case-sensitive)
- **Router base path**: Konfigurerad som `'/'` i vite.config.js (viktigt för GitHub Pages)
- **Dev server port**: 5173 (Vite default)
- **Deployment target**: GitHub Pages (gh-pages branch)
- **Client-side routing**: Kräver `historyApiFallback: true` i dev server config

## Development Workflow

1. Gör ändringar i koden
2. Testa lokalt med `npm run dev`
3. Om du lagt till bilder: kör `npm run build:gallery`
4. Kör `npm run lint` för code quality check
5. Kör `npx playwright test` för E2E tests (om relevanta ändringar)
6. Kör `npm run build` för att verifiera att production build fungerar
7. Granska `dist/stats.html` för bundle size analys
8. Commit och push
9. Deploy med `npm run deploy` (kör build automatiskt)

## Tech Stack Summary

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.2.3
- **Routing**: React Router DOM 7.9.3
- **UI Libraries**:
  - react-image-gallery (lightbox)
  - lucide-react (icons)
  - react-masonry-css (grid layouts)
- **Testing**: Playwright 1.55.0
- **Deployment**: gh-pages
- **Code Quality**: ESLint 9.x