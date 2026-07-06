// Single source of truth for per-route SEO meta.
// Used by pages via useSeo() and by scripts/generate-route-pages.js
// to prerender static HTML per route (GitHub Pages returns 404 status
// for SPA deep links otherwise, which blocks indexing).
const SITE_URL = "https://storegardensju.se";

// GitHub Pages serves routes as directories and 301-redirects
// /kurser -> /kurser/, so canonical URLs must use the trailing slash.
export function canonicalUrl(path) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}/`;
}

export const seoMeta = {
  home: {
    title: "Storegården 7 - Eventlokal, Keramik & Målarkurser i Lidköping",
    description:
      "Storegården 7 är en charmig eventlokal för bröllop, fester och företagsevent. Vi erbjuder även keramik- och målarkurser, workshops och utställningar. Beläget 15 minuter från Lidköping centrum.",
    path: "/",
  },
  event: {
    title: "Eventlokal för bröllop & fest i Lidköping | Storegården 7",
    description:
      "Hyr eventlokal på Storegården 7 utanför Lidköping. 360 kvm, plats för 150+ sittande gäster, bar och kök. Perfekt för bröllop, fest och företagsevent.",
    path: "/event",
  },
  kurser: {
    title: "Yogakurs & målarkurs i Lidköping – Heldag 13 juli 2026 | Storegården 7",
    description:
      "Boka yogapass, målarkurs eller heldag med lunch på Storegården 7 utanför Lidköping. Yoga med Lina Wiklund, måleri i akvarell och akryl med Ann Wiklund. 13 juli 2026.",
    path: "/kurser",
  },
  mohippa: {
    title: "Möhippa i Lidköping - Fira på gården | Storegården 7",
    description:
      "Ordna möhippa på Storegården 7 utanför Lidköping. Baspaket från 500 kr/person med aktiviteter som keramik, måleri och yoga i lantlig gårdsmiljö.",
    path: "/mohippa",
  },
  konst: {
    title: "Konst & keramik i Lidköping | Storegården 7",
    description:
      "Keramikworkshops, målarkurser och utställningar på Storegården 7 utanför Lidköping. Skapa i inspirerande gårdsmiljö med konstnären Ann Wiklund.",
    path: "/konst",
  },
  galleri: {
    title: "Bildgalleri | Storegården 7",
    description:
      "Se bilder från bröllop, fester, kurser och utställningar på Storegården 7 utanför Lidköping.",
    path: "/galleri",
  },
  omOss: {
    title: "Om oss | Storegården 7",
    description:
      "Möt familjen bakom Storegården 7 utanför Lidköping - Ann, Carl, Lina och Måns Wiklund.",
    path: "/om-oss",
  },
  butik: {
    title: "Butik - Keramik & konst | Storegården 7",
    description:
      "Handla handgjord keramik och konst från Storegården 7 utanför Lidköping.",
    path: "/butik",
  },
};
