// Single source of truth for per-route SEO meta.
// Used by pages via useSeo() and by scripts/generate-route-pages.js
// to prerender static HTML per route (GitHub Pages returns 404 status
// for SPA deep links otherwise, which blocks indexing).
const SITE_URL = "https://storegardensju.se";
const COURSE_IMAGE = `${SITE_URL}/images/evenemang/yoga-loft.webp`;
const PAINTING_COURSE_IMAGE = `${SITE_URL}/images/evenemang/maleri-kurs.webp`;
const EVENT_IMAGE = `${SITE_URL}/images/evenemang/kurser-header.webp`;
const COURSE_EVENT_END = "2026-07-14T00:00:00+02:00";

// GitHub Pages serves routes as directories and 301-redirects
// /kurser -> /kurser/, so canonical URLs must use the trailing slash.
export function canonicalUrl(path) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}/`;
}

export function activeJsonLd(meta, now = new Date()) {
  const jsonLd = Array.isArray(meta?.jsonLd) ? meta.jsonLd : [];
  if (new Date(now).getTime() < new Date(COURSE_EVENT_END).getTime()) {
    return jsonLd;
  }

  return [];
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
    title: "Yoga på loftet i Lidköping | Storegården 7",
    description:
      "Välkommen på Yoga på loftet med Lina Wiklund på Storegården 7 utanför Lidköping. Torsdag 30 juli kl 18:00. Lugn och härlig yoga i lantlig gårdsmiljö.",
    path: "/kurser",
    ogTitle: "Yoga på loftet på Storegården 7",
    ogDescription:
      "Yoga på loftet torsdag 30 juli kl 18:00 med Lina Wiklund på Storegården 7 i Lidköping/Rackeby.",
    image: COURSE_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: "Yoga på loftet på Storegården 7",
        description:
          "Lugnt och avslappnande yogapass med Lina Wiklund på loftet på Storegården 7 utanför Lidköping. Du är välkommen 30 min innan (17:30) för att landa. Yogamattor finns på plats.",
        startDate: "2026-07-30T18:00:00+02:00",
        endDate: "2026-07-30T19:30:00+02:00",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        image: [COURSE_IMAGE, `${SITE_URL}/images/evenemang/lina-yoga.jpg`],
        location: {
          "@type": "Place",
          name: "Storegården 7",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Storegården 7",
            addressLocality: "Rackeby",
            addressRegion: "Västra Götaland",
            postalCode: "531 96",
            addressCountry: "SE",
          },
        },
        organizer: {
          "@type": "Organization",
          name: "Storegården 7",
          url: SITE_URL,
        },
        performer: {
          "@type": "Person",
          name: "Lina Wiklund",
        },
        offers: {
          "@type": "Offer",
          name: "Yoga på loftet pass",
          availability: "https://schema.org/InStock",
          url: canonicalUrl("/kurser"),
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Yogakurs & Yogapass i Lidköping",
        description:
          "Yogapass nära Lidköping med fokus på andning, närvaro och återhämtning. Passar både nybörjare och vana deltagare.",
        provider: {
          "@type": "Organization",
          name: "Storegården 7",
          sameAs: SITE_URL,
        },
        image: COURSE_IMAGE,
        inLanguage: "sv-SE",
        areaServed: {
          "@type": "City",
          name: "Lidköping",
        },
        courseMode: "onsite",
        hasCourseInstance: {
          "@type": "CourseInstance",
          name: "Yoga på loftet",
          startDate: "2026-07-30T18:00:00+02:00",
          courseMode: "onsite",
          location: {
            "@type": "Place",
            name: "Storegården 7",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Storegården 7",
              addressLocality: "Rackeby",
              addressRegion: "Västra Götaland",
              postalCode: "531 96",
              addressCountry: "SE",
            },
          },
          instructor: {
            "@type": "Person",
            name: "Lina Wiklund",
          },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "När är nästa yoga på Storegården 7?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nästa yogapass 'Yoga på loftet' hålls torsdagen den 30 juli kl 18:00 med Lina Wiklund.",
            },
          },
          {
            "@type": "Question",
            name: "Behöver jag ta med egen yogamatta?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yogamattor finns att låna på plats, men om du har en egen matta får du gärna ta med den.",
            },
          },
          {
            "@type": "Question",
            name: "När bör man komma till yogan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Du är varmt välkommen 30 minuter innan passet startar (från kl 17:30) för att landa och förbereda dig i lugn och ro.",
            },
          },
          {
            "@type": "Question",
            name: "Passar yogan för nybörjare?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ja, Yoga på loftet innehåller guidning och vila som passar både nybörjare och vana utövare.",
            },
          },
          {
            "@type": "Question",
            name: "Var ligger Storegården 7?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Storegården 7 ligger i Rackeby, ca 15 minuter utanför Lidköping.",
            },
          },
        ],
      },
    ],
  },
  mohippa: {
    title: "Gruppdagar i Lidköping | Storegården 7",
    description:
      "Planera möhippa, svensexa, teambuilding, afterwork eller workshop på Storegården 7 utanför Lidköping. Baspaket från 500 kr/person med kreativa aktiviteter i lantlig gårdsmiljö.",
    path: "/gruppdagar",
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
  mansPortfolio: {
    title: "Måns Wiklund | Portfolio & Projekt | Storegården 7",
    description:
      "Måns Wiklund - Junior Fullstack & DevOps-utvecklare. Utforska projekt som Storegården 7 webbsida, Padelcompanion, Vad Händer Sidan, Foderstallet och ViHop.",
    path: "/om-oss/portfolj/mans",
  },
  butik: {
    title: "Butik - Keramik & konst | Storegården 7",
    description:
      "Handla handgjord keramik och konst från Storegården 7 utanför Lidköping.",
    path: "/butik",
  },
};
