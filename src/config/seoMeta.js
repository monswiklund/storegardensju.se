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

  return jsonLd.filter((entry) => entry["@type"] !== "Event");
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
    title: "Yogakurs & målarkurs i Lidköping | Storegården 7",
    description:
      "Boka yogakurs och målarkurs nära Lidköping på Storegården 7. Mjuk yoga med Lina Wiklund, måla akvarell och akryl med Ann Wiklund eller boka heldag.",
    path: "/kurser",
    ogTitle: "Yogakurs & målarkurs i Lidköping | Storegården 7",
    ogDescription:
      "Boka yoga, målarkurs, privat grupp eller heldag med yoga och måleri på Storegården 7 utanför Lidköping.",
    image: COURSE_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Yogakurs i Lidköping",
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
          name: "Yogapass på Storegården 7",
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
          offers: {
            "@type": "Offer",
            price: "200",
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            url: canonicalUrl("/kurser"),
          },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Målarkurs i Lidköping",
        description:
          "Glädjefylld målarkurs nära Lidköping med akvarell och akryl. Passar både nybörjare och vana deltagare som vill måla i lugn gårdsmiljö.",
        provider: {
          "@type": "Organization",
          name: "Storegården 7",
          sameAs: SITE_URL,
        },
        image: PAINTING_COURSE_IMAGE,
        inLanguage: "sv-SE",
        areaServed: {
          "@type": "City",
          name: "Lidköping",
        },
        courseMode: "onsite",
        hasCourseInstance: {
          "@type": "CourseInstance",
          name: "Målarkurs på Storegården 7",
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
            name: "Ann Wiklund",
          },
          offers: {
            "@type": "Offer",
            price: "600",
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            url: `${canonicalUrl("/kurser")}#maleri`,
          },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: "Heldag med yoga & måleri på Storegården 7",
        description:
          "Kursdag utanför Lidköping: yogapass med Lina Wiklund på förmiddagen och målarkurs i akvarell och akryl med Ann Wiklund på eftermiddagen.",
        startDate: "2026-07-13T10:00:00+02:00",
        endDate: "2026-07-13T17:30:00+02:00",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        image: [EVENT_IMAGE],
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
        performer: [
          { "@type": "Person", name: "Lina Wiklund" },
          { "@type": "Person", name: "Ann Wiklund" },
        ],
        offers: [
          {
            "@type": "Offer",
            name: "Yogapass",
            price: "200",
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            validFrom: "2026-07-06",
            url: `${canonicalUrl("/kurser")}#yoga`,
          },
          {
            "@type": "Offer",
            name: "Målarkurs",
            price: "600",
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            validFrom: "2026-07-06",
            url: `${canonicalUrl("/kurser")}#maleri`,
          },
          {
            "@type": "Offer",
            name: "Heldagspaket med lunch",
            price: "900",
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            validFrom: "2026-07-06",
            url: `${canonicalUrl("/kurser")}#heldag`,
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Var finns yogakursen och målarkursen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yogakursen och målarkursen hålls på Storegården 7 i Rackeby, cirka 15 minuter från Lidköping.",
            },
          },
          {
            "@type": "Question",
            name: "Passar yogan nybörjare?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ja, passen är lugna och passar både nybörjare och vana deltagare.",
            },
          },
          {
            "@type": "Question",
            name: "Passar målarkursen nybörjare?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ja, målarkursen är prestationsfri och passar både nybörjare och vana deltagare som vill måla med akvarell och akryl.",
            },
          },
          {
            "@type": "Question",
            name: "Vad kostar yoga och målarkurs?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yogapasset kostar 200 kr per person, målarkursen kostar 600 kr per person och heldag med yoga, måleri, lunch och fika kostar 900 kr per person.",
            },
          },
          {
            "@type": "Question",
            name: "Kan man boka yoga för en privat grupp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ja, det går att höra av sig om privat yogapass, målarkurs, gruppbokning eller heldag med yoga och måleri.",
            },
          },
        ],
      },
    ],
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
