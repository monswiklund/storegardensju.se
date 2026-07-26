// Single source of truth for per-route SEO meta.
// Used by pages via useSeo() and by scripts/generate-route-pages.js
// to prerender static HTML per route (GitHub Pages returns 404 status
// for SPA deep links otherwise, which blocks indexing).
import {
  COURSE_LOCATION,
  MALERI_TRACK_ID,
  YOGA_TRACK_ID,
  formatPassDate,
  formatPassTime,
  nextPass,
  ownedUpcomingPasses,
  passAnchor,
  resolvedFaq,
  trackById,
  upcomingPasses,
} from "../data/courseEvents.js";

const SITE_URL = "https://storegardensju.se";
export const WEDDING_PATH = "/event/brollop";

export const WEDDING_FAQ = [
  {
    question: "Får vi ta med egen mat och dryck?",
    answer:
      "Ja. Ni har full frihet att ta med egen mat och dryck och kan forma middagen efter era egna önskemål.",
  },
  {
    question: "Hur många gäster får plats på bröllopet?",
    answer:
      "Loftet har plats för 150+ sittande gäster och ladan för 50+ sittande. För stående mingel rymmer lokalerna tillsammans 300+ gäster.",
  },
  {
    question: "Vad finns på plats i lokalen?",
    answer:
      "Glas, tallrikar, bestick, bord och stolar finns på plats. Köket har bra arbetsytor, handdisk samt varmt och kallt vatten. Muurikka-hällar kan hyras. Ni har också tillgång till bar, lounge, dansgolv, toaletter, ljudanläggning och festbelysning.",
  },
  {
    question: "Kan ni hjälpa till med personal?",
    answer:
      "Ja. Vid behov kan vi hjälpa till att ordna serveringspersonal, bar eller DJ till bröllopsdagen.",
  },
];

// GitHub Pages serves routes as directories and 301-redirects
// /kurser -> /kurser/, so canonical URLs must use the trailing slash.
export function canonicalUrl(path) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}/`;
}

const absoluteUrl = (path) =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

const schemaPlace = {
  "@type": "Place",
  name: COURSE_LOCATION.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: COURSE_LOCATION.streetAddress,
    addressLocality: COURSE_LOCATION.locality,
    addressRegion: COURSE_LOCATION.region,
    postalCode: COURSE_LOCATION.postalCode,
    addressCountry: COURSE_LOCATION.country,
  },
};

const weddingJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Bröllop på Storegården 7",
    serviceType: "Bröllopslokal",
    description:
      "Bröllopslokal i en renoverad lada på Storegården 7 utanför Lidköping, med loft för 150+ sittande gäster, bar, kök, lounge och dansgolv.",
    url: canonicalUrl(WEDDING_PATH),
    image: absoluteUrl("/images/event/hero/hero-2.webp"),
    provider: {
      "@type": "Organization",
      name: COURSE_LOCATION.name,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "City",
      name: "Lidköping",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: WEDDING_FAQ.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  },
];

// --- Hub copy ---------------------------------------------------------------
//
// One entry per course track. The prose lives here rather than in courseEvents
// because it is SEO copy; the dates, prices and FAQ it reads come from the data
// module. Each hub targets its own search: /kurser/yoga "yoga i Lidköping",
// /kurser/konst "målarkurs / keramikkurs i Lidköping". /kurser above them is an
// index that carries the generic "kurser i Lidköping" query and links onward.

const HUB_COPY = {
  [YOGA_TRACK_ID]: {
    // Title kept verbatim - the yoga hub already ranks under this wording, and
    // the move to /kurser/yoga is enough of a reset on its own.
    title: "Yoga på loftet i Lidköping | Storegården 7",
    h1: "Yoga på loftet",
    ogFallbackTitle: "Yoga på loftet på Storegården 7",
    // Landscape 1600x1200 - social previews crop portrait images badly.
    image: absoluteUrl("/images/evenemang/lina-yoga-header.jpg"),
    courseImage: absoluteUrl("/images/evenemang/yoga-loft.webp"),
    courseName: "Yoga i Lidköping - Yoga på loftet",
    courseDescription:
      "Yogapass nära Lidköping med fokus på andning, närvaro och återhämtning. Passar både nybörjare och vana deltagare.",
    description(pass) {
      const instructor = trackById(YOGA_TRACK_ID).instructor.name;
      if (!pass) {
        return `Yoga i lugnt tempo med ${instructor} på loftet på Storegården 7 utanför Lidköping. Se kommande datum och praktisk information.`;
      }
      const price = pass.price ? ` ${pass.price} kr, betalas på plats.` : "";
      return `${pass.title} med ${instructor} på Storegården 7 utanför Lidköping. ${formatPassDate(pass)} kl ${formatPassTime(pass.startAt)}.${price} Yoga i lugnt tempo på loftet.`;
    },
    paragraphs(pass) {
      const instructor = trackById(YOGA_TRACK_ID).instructor.name;
      const intro = pass
        ? `${instructor} håller yoga i lugnt tempo på loftet på Storegården 7. Nästa tillfälle är ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)} i Rackeby, ${COURSE_LOCATION.travelNote}.`
        : `${instructor} håller yoga i lugnt tempo på loftet på Storegården 7 i Rackeby, ${COURSE_LOCATION.travelNote}.`;

      const practical = pass
        ? `${pass.summary}${pass.doorsOpenAt ? ` Du kan komma från kl ${formatPassTime(pass.doorsOpenAt)}.` : ""}${pass.price ? ` Pris ${pass.price} kr per person, betalas på plats.` : ""}${pass.dropIn ? " Drop-in, ingen föranmälan behövs." : ""} Yogamattor finns att låna.`
        : "Yogamattor finns att låna, men du får gärna ta med en egen. Hör av dig till Lina om du vill veta när nästa pass blir.";

      return [intro, practical];
    },
  },
  [MALERI_TRACK_ID]: {
    title: "Målarkurs & keramikkurs i Lidköping | Storegården 7",
    h1: "Skapande — måleri & keramik i Lidköping",
    ogFallbackTitle: "Måleri & keramik på Storegården 7",
    image: absoluteUrl("/images/evenemang/maleri-kurs.webp"),
    courseImage: absoluteUrl("/images/evenemang/maleri-kurs.webp"),
    courseName: "Målarkurs & keramikkurs i Lidköping",
    courseDescription:
      "Kurser i måleri med akvarell och akryl samt keramik med handbygge, ringling och drejning i gårdsateljén utanför Lidköping. För både nybörjare och vana.",
    description(pass) {
      const instructor = trackById(MALERI_TRACK_ID).instructor.name;
      if (!pass) {
        return `Målarkurser och keramikkurser med konstnären ${instructor} i gårdsateljén på Storegården 7 utanför Lidköping. För nybörjare, vana och privata grupper.`;
      }
      const price = pass.price ? ` ${pass.price} kr per person.` : "";
      return `${pass.title} med ${instructor} i ateljén på Storegården 7 utanför Lidköping. ${formatPassDate(pass)} kl ${formatPassTime(pass.startAt)}.${price} Målarkurser och keramikkurser för nybörjare och vana.`;
    },
    paragraphs(pass) {
      const instructor = trackById(MALERI_TRACK_ID).instructor.name;
      const intro = pass
        ? `I gårdsateljén på Storegården 7 håller konstnären ${instructor} kurser i måleri och keramik. Nästa kurs är ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)} i ateljén i Rackeby, ${COURSE_LOCATION.travelNote}.`
        : `I gårdsateljén på Storegården 7 håller konstnären ${instructor} kurser i måleri och keramik - akvarell, akryl, handbygge, ringling och drejning. Ateljén ligger i Rackeby, ${COURSE_LOCATION.travelNote}.`;

      const practical = pass
        ? `${pass.summary}${pass.price ? ` Pris ${pass.price} kr per person.` : ""} Material och verktyg finns i ateljén - ta med kläder som får bli lite färg eller lera på.`
        : "Material och verktyg finns i ateljén, så du behöver inte ta med något eget. Vi håller både kurser med fast datum och privata kurser för möhippor, svensexor, födelsedagar och företag.";

      return [intro, practical];
    },
  },
};

// --- Structured data -------------------------------------------------------

/**
 * One Event object per upcoming pass the hub owns. Multiple Events on a single
 * page is supported by Google; separate URLs per pass would only produce thin
 * pages that die the day after the event. A pass shown on two hubs is only
 * marked up on its primary one, so the two URLs never compete for one result.
 */
function passEventSchema(pass, trackId) {
  const track = trackById(trackId);
  const copy = HUB_COPY[trackId];
  const passUrl = `${canonicalUrl(track.hubPath)}#${passAnchor(pass)}`;
  const images = pass.images.map((image) => absoluteUrl(image.url));

  const event = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${pass.title} på ${COURSE_LOCATION.name}`,
    description: pass.description,
    startDate: pass.startAt,
    endDate: pass.endAt,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: images.length > 0 ? images : [copy.image],
    inLanguage: "sv-SE",
    // Anchor, so a result for a specific pass lands on that section.
    url: passUrl,
    location: schemaPlace,
    organizer: {
      "@type": "Organization",
      name: COURSE_LOCATION.name,
      url: SITE_URL,
    },
    performer: {
      "@type": "Person",
      name: track.instructor.name,
      jobTitle: track.instructor.role,
    },
  };

  // Google ignores an Offer without price + priceCurrency, so only emit a
  // complete one.
  if (pass.price) {
    event.isAccessibleForFree = false;
    event.offers = {
      "@type": "Offer",
      name: pass.dropIn ? `${pass.title} - drop-in` : pass.title,
      price: String(pass.price),
      priceCurrency: pass.priceCurrency,
      availability: "https://schema.org/InStock",
      url: passUrl,
    };
  }

  return event;
}

function courseSchema(trackId, now) {
  const track = trackById(trackId);
  const copy = HUB_COPY[trackId];
  const hubUrl = canonicalUrl(track.hubPath);

  const instances = upcomingPasses(trackId, now).map((pass) => ({
    "@type": "CourseInstance",
    name: pass.title,
    startDate: pass.startAt,
    endDate: pass.endAt,
    courseMode: "onsite",
    location: schemaPlace,
    instructor: {
      "@type": "Person",
      name: trackById(pass.primaryTrack).instructor.name,
      jobTitle: trackById(pass.primaryTrack).instructor.role,
    },
    ...(pass.price
      ? {
          offers: {
            "@type": "Offer",
            price: String(pass.price),
            priceCurrency: pass.priceCurrency,
            availability: "https://schema.org/InStock",
            url: `${canonicalUrl(trackById(pass.primaryTrack).hubPath)}#${passAnchor(pass)}`,
          },
        }
      : {}),
  }));

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: copy.courseName,
    description: copy.courseDescription,
    url: hubUrl,
    provider: {
      "@type": "Organization",
      name: COURSE_LOCATION.name,
      sameAs: SITE_URL,
    },
    image: copy.courseImage,
    inLanguage: "sv-SE",
    areaServed: {
      "@type": "City",
      name: "Lidköping",
    },
    courseMode: "onsite",
  };

  if (instances.length > 0) {
    course.hasCourseInstance = instances;
  }

  return course;
}

function faqSchema(trackId, now) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: resolvedFaq(trackId, now).map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

const hubJsonLd = (trackId) => (now = new Date()) => [
  ...ownedUpcomingPasses(trackId, now).map((pass) =>
    passEventSchema(pass, trackId)
  ),
  courseSchema(trackId, now),
  faqSchema(trackId, now),
];

/**
 * JSON-LD for a route, evaluated against `now`.
 *
 * Course and FAQPage are evergreen and always emitted for the course hubs;
 * Event objects only for passes that have not finished. That way a passed date
 * can never linger in structured data - previously a hardcoded cutoff date did
 * this job and silently expired, taking all structured data with it.
 */
export function activeJsonLd(meta, now = new Date()) {
  if (typeof meta?.buildJsonLd === "function") {
    return meta.buildJsonLd(now);
  }

  return Array.isArray(meta?.jsonLd) ? meta.jsonLd : [];
}

// Meta description and prerendered copy for the hubs follow the next pass, so a
// new date in courseEvents.js propagates to the SERP snippet and the crawlable
// shell without anyone editing this file.
function hubDescription(trackId, now = new Date()) {
  return HUB_COPY[trackId].description(nextPass(trackId, now));
}

function hubStaticContent(trackId, now = new Date()) {
  const copy = HUB_COPY[trackId];
  return {
    h1: copy.h1,
    paragraphs: copy.paragraphs(nextPass(trackId, now)),
    // Same answers the page renders and the FAQPage JSON-LD declares.
    faq: resolvedFaq(trackId, now),
  };
}

// The index page names both subjects and both instructors in prose, so the
// generic "kurser i Lidköping" query has something to match without repeating
// either hub's copy. Next dates are read from the data, like the hubs do.
function kurserIndexContent(now = new Date()) {
  const yoga = nextPass(YOGA_TRACK_ID, now);
  const maleri = nextPass(MALERI_TRACK_ID, now);
  const yogaTrack = trackById(YOGA_TRACK_ID);
  const maleriTrack = trackById(MALERI_TRACK_ID);

  const nextLine = (pass) =>
    pass
      ? ` Nästa tillfälle är ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)}.`
      : "";

  return {
    h1: "Kurser på Storegården 7",
    paragraphs: [
      `På Storegården 7 i Rackeby, ${COURSE_LOCATION.travelNote}, håller vi två sorters kurser. På loftet leder ${yogaTrack.instructor.name} yoga med fokus på andning, närvaro och återhämtning.${nextLine(yoga)}`,
      `I gårdsateljén håller konstnären ${maleriTrack.instructor.name} kurser i måleri med akvarell och akryl samt keramik med handbygge, ringling och drejning.${nextLine(maleri)} Material och verktyg finns på plats.`,
      "Båda kurserna går även att boka privat för en grupp - möhippa, svensexa, teambuilding eller ett gäng vänner - med lokal och fika på gården. Datum, priser och praktiska detaljer står på respektive kurssida.",
    ],
  };
}

function hubOgTitle(trackId, now = new Date()) {
  const pass = nextPass(trackId, now);
  return pass
    ? `${pass.title} på Storegården 7 - ${formatPassDate(pass).toLowerCase()}`
    : HUB_COPY[trackId].ogFallbackTitle;
}

export const seoMeta = {
  home: {
    title: "Storegården 7 - Eventlokal, Keramik & Målarkurser i Lidköping",
    description:
      "Storegården 7 är en eventlokal i Rackeby för bröllop, fester och företagsevent. Här finns också kurser i keramik, måleri och yoga, 15 minuter från Lidköpings centrum.",
    path: "/",
    staticContent: {
      h1: "Välkommen till Storegården 7",
      paragraphs: [
        "Storegården 7 är en familjedriven eventlokal, ateljé och gårdsbutik i Rackeby, 15 minuter från Lidköpings centrum.",
        "I ladan och på loftet ordnas kalas, bröllop och andra fester. I ateljén finns kurser i måleri och keramik. På gården har vi också yoga, heldagar och loppis vid vissa tillfällen.",
      ],
    },
  },
  event: {
    title: "Eventlokal i Lidköping | Storegården 7",
    description:
      "Eventlokal på Storegården 7 utanför Lidköping för bröllop, fest, företagsevent och gruppdagar i en renoverad lada med loft.",
    path: "/event",
    staticContent: {
      h1: "Event på Storegården 7",
      paragraphs: [
        "På Storegården 7 kan ni ordna bröllop, privat fest, företagsevent eller gruppdag i en renoverad lada strax utanför Lidköping.",
        "Ladan och loftet ger totalt 360 kvm inomhus. Loftet tar 150+ sittande gäster, ladan 50+ sittande och tillsammans rymmer lokalerna 300+ stående gäster. Bar, kök, möbler och dukning finns på plats.",
      ],
    },
  },
  eventWedding: {
    title: "Bröllopslokal i Lidköping | Storegården 7",
    description:
      "Fira bröllop på Storegården 7 utanför Lidköping. Renoverad lada med loft för 150+ sittande gäster, bar, kök, lounge och dansgolv.",
    path: WEDDING_PATH,
    image: absoluteUrl("/images/event/hero/hero-2.webp"),
    staticContent: {
      h1: "Bröllop på Storegården 7",
      paragraphs: [
        "Hyr ladan och loftet för bröllop strax utanför Lidköping. Här kan ni ha välkomstskål, middag och fest på samma gård.",
        "Loftet har plats för 150+ sittande gäster och ladan för 50+ sittande. Köket har bra arbetsytor, handdisk samt varmt och kallt vatten, och Muurikka-hällar kan hyras. Bar, lounge, dansgolv, ljud och festbelysning finns på plats. Ni får ta med egen mat och dryck.",
      ],
      faq: WEDDING_FAQ,
    },
    jsonLd: weddingJsonLd,
  },
  // Index over the two hubs. Deliberately has no Course or FAQPage of its own:
  // those belong to the hub that owns the subject, and duplicating them here
  // would make the three pages compete for the same result.
  kurser: {
    title: "Kurser i Lidköping - yoga, måleri & keramik | Storegården 7",
    description:
      "Kurser på Storegården 7 utanför Lidköping: yoga på loftet med utbildade yogainstruktören Lina Wiklund och kurser i måleri och keramik i gårdsateljén med konstnären Ann Wiklund. Se nästa tillfälle för respektive kurs.",
    path: "/kurser",
    get staticContent() {
      return kurserIndexContent();
    },
  },
  kurserYoga: {
    title: HUB_COPY[YOGA_TRACK_ID].title,
    get description() {
      return hubDescription(YOGA_TRACK_ID);
    },
    path: trackById(YOGA_TRACK_ID).hubPath,
    get ogTitle() {
      return hubOgTitle(YOGA_TRACK_ID);
    },
    get ogDescription() {
      return hubDescription(YOGA_TRACK_ID);
    },
    image: HUB_COPY[YOGA_TRACK_ID].image,
    get staticContent() {
      return hubStaticContent(YOGA_TRACK_ID);
    },
    buildJsonLd: hubJsonLd(YOGA_TRACK_ID),
  },
  mohippa: {
    title: "Gruppdagar i Lidköping | Storegården 7",
    description:
      "Boka möhippa, svensexa, teambuilding, afterwork eller workshop på Storegården 7 utanför Lidköping. Baspaket från 500 kr/person med lokal och praktisk hjälp.",
    path: "/gruppdagar",
    staticContent: {
      h1: "Er gruppdag på Storegården 7",
      paragraphs: [
        "Boka en gruppdag på gården för möhippa, svensexa, teambuilding, afterwork eller workshop. Lokal och praktisk hjälp ingår i baspaketet.",
        "Pris från 500 kr per person. Lokalen är er 10:00-22:00. Upplägget är ett baspaket med tillval per aktivitet, så ni kan lägga till måleri, keramik eller yoga efter vad gruppen vill göra.",
      ],
    },
  },
  kurserKonst: {
    title: HUB_COPY[MALERI_TRACK_ID].title,
    get description() {
      return hubDescription(MALERI_TRACK_ID);
    },
    path: trackById(MALERI_TRACK_ID).hubPath,
    get ogTitle() {
      return hubOgTitle(MALERI_TRACK_ID);
    },
    get ogDescription() {
      return hubDescription(MALERI_TRACK_ID);
    },
    image: HUB_COPY[MALERI_TRACK_ID].image,
    get staticContent() {
      return hubStaticContent(MALERI_TRACK_ID);
    },
    buildJsonLd: hubJsonLd(MALERI_TRACK_ID),
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
        "Möt familjen bakom Storegården 7. Ann Wiklund är konstnär och keramiker och håller kurserna i ateljén. Carl Wiklund är event- och restaurangkonsult. Lina Wiklund arbetar med planering, event och design och leder yogan på loftet som utbildad yogainstruktör. Måns Wiklund är junior fullstack- och DevOps-utvecklare och byggde den här sidan.",
        "Storegården 7 ligger i Rackeby, 15 minuter från Lidköpings centrum. På gården finns en renoverad lada med loft, en ateljé och en gårdsbutik.",
      ],
    },
  },
  mansPortfolio: {
    title: "Måns Wiklund | Portfolio & Projekt | Storegården 7",
    description:
      "Måns Wiklund är junior fullstack- och DevOps-utvecklare. Se projekt som Storegården 7 webbplats, Padelcompanion, Vad Händer Sidan, Foderstallet och ViHop.",
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
        "I gårdsbutiken på Storegården 7 utanför Lidköping säljer vi konst och handgjord keramik från Ann Wiklunds ateljé.",
        "Sortimentet växlar med vad som kommer ut ur ugnen, så utbudet i webbutiken uppdateras löpande. Har du frågor om en produkt eller vill se något på plats i Rackeby är du välkommen att höra av dig.",
      ],
    },
  },
};
