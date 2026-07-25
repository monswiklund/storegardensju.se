// Single source of truth for per-route SEO meta.
// Used by pages via useSeo() and by scripts/generate-route-pages.js
// to prerender static HTML per route (GitHub Pages returns 404 status
// for SPA deep links otherwise, which blocks indexing).
const SITE_URL = "https://storegardensju.se";
const COURSE_IMAGE = `${SITE_URL}/images/evenemang/yoga-loft.webp`;
// Landscape 1600x1200 - social previews crop portrait images badly.
const YOGA_OG_IMAGE = `${SITE_URL}/images/evenemang/lina-yoga-header.jpg`;
// Event JSON-LD must stop being emitted once the event has passed, otherwise
// Search Console flags a past-dated Event. Bump this with every new event.
const COURSE_EVENT_END = "2026-07-30T19:30:00+02:00";

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
    staticContent: {
      h1: "Välkommen till Storegården 7",
      paragraphs: [
        "Storegården 7 är en eventlokal, ateljé och gårdsbutik i Rackeby, 15 minuter utanför Lidköpings centrum. En ständigt växande plats där tanken är att det ska finnas något för alla.",
        "Hyr vår lokal för kalas, bröllop eller fest. Gå en konstnärlig kurs i måleri eller keramik. Följ med på yoga och heldagar på gården. Emellanåt har vi loppis, och gårdsbutiken är fylld med konst och keramik.",
      ],
    },
  },
  event: {
    title: "Eventlokal för bröllop & fest i Lidköping | Storegården 7",
    description:
      "Hyr eventlokal på Storegården 7 utanför Lidköping. 360 kvm, plats för 150+ sittande gäster, bar och kök. Perfekt för bröllop, fest och företagsevent.",
    path: "/event",
    staticContent: {
      h1: "Bröllop, Event & Fest",
      paragraphs: [
        "Skapa minnesvärda stunder på vackra Storegården 7. Vår gård passar lika bra för ett stort firande som för ett mer personligt event. Här får ni en lokal med gott om yta, rätt utrustning och en stämningsfull miljö som känns varm direkt när gästerna kliver in.",
        "Med totalt 360 kvm inomhusyta fördelat på två våningar i vår omsorgsfullt renoverade lada har ni all flexibilitet ni behöver. Loftet tar 150+ sittande gäster, ladan 50+ sittande och 300+ på mingel. Bar, kök och det praktiska ingår i hyran.",
      ],
    },
  },
  kurser: {
    title: "Yoga på loftet i Lidköping | Storegården 7",
    description:
      "Välkommen på Yoga på loftet med Lina Wiklund på Storegården 7 utanför Lidköping. Torsdag 30 juli kl 18:00. Lugn och härlig yoga i lantlig gårdsmiljö.",
    path: "/kurser",
    ogTitle: "Yoga på loftet på Storegården 7 - torsdag 30 juli",
    ogDescription:
      "Drop-in yoga på loftet torsdag 30 juli kl 18:00 med Lina Wiklund på Storegården 7 i Lidköping/Rackeby. 150 kr, ingen föranmälan.",
    image: YOGA_OG_IMAGE,
    staticContent: {
      h1: "Yoga på loftet",
      paragraphs: [
        "Välkommen på en lugn och skön yogastund i vår stämningsfulla gårdsmiljö tillsammans med Lina Wiklund. Nästa tillfälle är torsdag 30 juli kl 18:00 på loftet på Storegården 7 i Rackeby, 15 minuter från Lidköping.",
        "Ett 90 minuters yogapass med guidning och skön vila i fridfull miljö. Du är välkommen från 17:30 för att landa. Pris 150 kr per person, betalas på plats. Drop-in, ingen föranmälan behövs. Yogamattor finns på plats, men ta gärna med din egen.",
      ],
    },
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
        image: [
          YOGA_OG_IMAGE,
          `${SITE_URL}/images/evenemang/lina-yoga.jpg`,
          COURSE_IMAGE,
        ],
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
        // Google Event rich results require price + priceCurrency + validFrom
        // on the Offer; without them the Offer block is ignored.
        offers: {
          "@type": "Offer",
          name: "Yoga på loftet - drop-in",
          price: "150",
          priceCurrency: "SEK",
          availability: "https://schema.org/InStock",
          validFrom: "2026-07-20T00:00:00+02:00",
          url: canonicalUrl("/kurser"),
        },
        isAccessibleForFree: false,
        inLanguage: "sv-SE",
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
          endDate: "2026-07-30T19:30:00+02:00",
          courseMode: "onsite",
          courseWorkload: "PT1H30M",
          offers: {
            "@type": "Offer",
            price: "150",
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            url: canonicalUrl("/kurser"),
          },
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
            name: "Vad kostar yogan på Storegården 7?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yoga på loftet kostar 150 kr per person och betalas på plats. Det är drop-in, så ingen föranmälan behövs.",
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
    staticContent: {
      h1: "Er gruppdag på Storegården 7",
      paragraphs: [
        "Samla gruppen på gården för möhippa, svensexa, teambuilding, afterwork eller workshop. En färdig grund för dagen, med lokal, hjälp på plats och kreativa tillval som gör er sammankomst personlig.",
        "Pris från 500 kr per person. Lokalen är er 10:00-22:00. Upplägget är ett baspaket med tillval per aktivitet, så ni kan lägga till måleri, keramik eller yoga efter vad gruppen vill göra.",
      ],
    },
  },
  konst: {
    title: "Konst & keramik i Lidköping | Storegården 7",
    description:
      "Keramikworkshops, målarkurser och utställningar på Storegården 7 utanför Lidköping. Skapa i inspirerande gårdsmiljö med konstnären Ann Wiklund.",
    path: "/konst",
    staticContent: {
      h1: "Skapande - Målning & Lera",
      paragraphs: [
        "Utforska din kreativitet i en inspirerande gårdsateljé på Storegården 7. Upptäck din kreativa sida med våra kurser i målning och keramik. I vår ljusa och välkomnande lokal får du skapa konst under professionell guidning av konstnären Ann Wiklund, oavsett om du är nybörjare eller mer erfaren.",
        "Oavsett om du vill lerkladda med kollegorna eller måla akvarell under en mysig möhippa har vi det perfekta paketet. Våra workshops är populära för möhippor, födelsedagar och teambuilding.",
      ],
    },
  },
  galleri: {
    title: "Bildgalleri | Storegården 7",
    description:
      "Se bilder från bröllop, fester, kurser och utställningar på Storegården 7 utanför Lidköping.",
    path: "/galleri",
    staticContent: {
      h1: "Bildgalleri från Storegården 7",
      paragraphs: [
        "Kika in i vårt galleri för att se bilder från gården, ateljén, festdukningar och tidigare evenemang. Här finns foton från bröllop och fester i ladan och på loftet, från målar- och keramikkurser i ateljén, från yoga på loftet och från utställningar och loppisar på gården.",
        "Storegården 7 ligger i Rackeby, 15 minuter utanför Lidköpings centrum. Bilderna visar både lokalerna som de ser ut inför ett event och gårdsmiljön runt omkring.",
      ],
    },
  },
  omOss: {
    title: "Om oss | Storegården 7",
    description:
      "Möt familjen bakom Storegården 7 utanför Lidköping - Ann, Carl, Lina och Måns Wiklund.",
    path: "/om-oss",
    staticContent: {
      h1: "Om oss på Storegården 7",
      paragraphs: [
        "Möt familjen bakom Storegården 7. Ann Wiklund är konstnär och keramiker och håller kurserna i ateljén. Carl Wiklund är event- och restaurangkonsult. Lina Wiklund arbetar med planering, event och design, och leder yogan på loftet. Måns Wiklund är junior fullstack- och DevOps-utvecklare och byggde den här sidan.",
        "Storegården 7 ligger 15 minuter utanför Lidköpings centrum i lantlig omgivning, långt från stadens brus. Vi har tagit vara på den gamla gårdens charm och kombinerat den med moderna bekvämligheter. På gården finns eventlokal, ateljé och gårdsbutik.",
      ],
    },
  },
  mansPortfolio: {
    title: "Måns Wiklund | Portfolio & Projekt | Storegården 7",
    description:
      "Måns Wiklund - Junior Fullstack & DevOps-utvecklare. Utforska projekt som Storegården 7 webbsida, Padelcompanion, Vad Händer Sidan, Foderstallet och ViHop.",
    path: "/om-oss/portfolj/mans",
    staticContent: {
      h1: "Måns Wiklund - Portfolio",
      paragraphs: [
        "Junior Fullstack- och DevOps-utvecklare, verksam på Sportson. Arbetar med Go, C# (.NET Core), SvelteKit, React och React Native, TypeScript, Postgres, SQLite samt moln- och containerinfrastruktur.",
        "Utvalda projekt: Storegården 7 webbsida, Padelcompanion, Vad Händer Sidan, Foderstallet och ViHop.",
      ],
    },
  },
  butik: {
    title: "Butik - Keramik & konst | Storegården 7",
    description:
      "Handla handgjord keramik och konst från Storegården 7 utanför Lidköping.",
    path: "/butik",
    staticContent: {
      h1: "Butik",
      paragraphs: [
        "Handgjord konst och keramik från lokala konstnärer. I gårdsbutiken på Storegården 7 utanför Lidköping säljer vi keramik och konst tillverkad i vår egen ateljé av Ann Wiklund.",
        "Sortimentet växlar med vad som kommer ut ur ugnen, så utbudet i webbutiken uppdateras löpande. Har du frågor om en produkt eller vill se något på plats i Rackeby är du välkommen att höra av dig.",
      ],
    },
  },
};
