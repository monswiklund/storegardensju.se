// Single source of truth for the courses that run on the farm.
//
// Consumed by four places that must never disagree:
//   - src/pages/KurserPage.jsx  (the yoga hub, /kurser/yoga)
//   - src/pages/ArtPage.jsx     (the maleri/keramik hub, /kurser/konst)
//   - src/config/seoMeta.js     (Event/Course/FAQPage JSON-LD + prerender copy)
//   - scripts/generate-route-pages.js (indirectly, via seoMeta)
//
// Two hubs, one per subject, under a /kurser index: /kurser/yoga targets
// "yoga i Lidköping" and /kurser/konst targets "målarkurs/keramikkurs i
// Lidköping". Those are different searches, so they get different URLs - but
// the same machinery. A pass is a section with an
// anchor on its hub rather than its own URL: one pass a month would otherwise
// produce a pile of thin pages that go stale the day after, splitting link
// equity instead of accumulating it.
//
// To add a pass: append to COURSE_PASSES with tracks/primaryTrack set. Nothing
// else needs touching - the upcoming/past split, the JSON-LD and the
// prerendered copy all derive from startAt/endAt.

export const COURSE_LOCATION = {
  name: "Storegården 7",
  streetAddress: "Storegården 7",
  postalCode: "531 98",
  locality: "Rackeby",
  region: "Västra Götaland",
  country: "SE",
  mapsUrl: "https://maps.google.com/?q=Storegården+7+Rackeby+Lidköping",
  travelNote: "15 minuter från Lidköpings centrum",
};

// One shared inbox for the farm - both instructors are reached there.
const CONTACT_EMAIL = "bylinawiklund@gmail.com";

export const INSTRUCTORS = {
  lina: {
    id: "lina",
    name: "Lina Wiklund",
    email: CONTACT_EMAIL,
    role: "Utbildad yogainstruktör",
    bio: "Lina är utbildad yogainstruktör och håller yogan på loftet. Passen går i ett lugnt tempo och passar både dig som är nybörjare och dig som har yogat länge.",
  },
  ann: {
    id: "ann",
    name: "Ann Wiklund",
    email: CONTACT_EMAIL,
    role: "Konstnär och keramiker",
    bio: "Ann Wiklund är konstnär och keramiker och håller kurserna i ateljén på Storegården 7. Hon undervisar i akvarell och akryl samt i handbygge, ringling och drejning. Du behöver inte ha målat eller arbetat med lera tidigare.",
  },
};

// Weekday + month names, since toLocaleDateString with sv-SE is not reliable
// across Node versions built without full ICU.
const WEEKDAYS = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];

const MONTHS = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

// The ISO strings carry their own +02:00 offset, so the calendar date is read
// straight out of the string. Going via Date getters would shift the date for
// anyone in another timezone - a pass on the 30th must read "30 juli" in Sydney
// too.
function passDateParts(isoString) {
  const [, year, month, day] = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoString);
  return { year: Number(year), month: Number(month), day: Number(day) };
}

/** "Torsdag 30 juli" - used in headings, badges and prerendered copy. */
export function formatPassDate(pass) {
  const { year, month, day } = passDateParts(pass.startAt);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday} ${day} ${MONTHS[month - 1]}`;
}

/** "18:00" in the event's own offset, not the reader's timezone. */
export function formatPassTime(isoString) {
  const match = /T(\d{2}):(\d{2})/.exec(isoString);
  return match ? `${match[1]}:${match[2]}` : "";
}

/** Calendar year of the pass, read from the ISO string for the same reason. */
export function passYear(pass) {
  return passDateParts(pass.startAt).year;
}

// --- Tracks -----------------------------------------------------------------
//
// A track is a subject with its own hub page. The FAQ lives here because it is
// rendered on the page AND emitted as FAQPage JSON-LD; Google requires the
// markup to match visible content, so both must read from one array.

export const YOGA_TRACK_ID = "yoga";
export const MALERI_TRACK_ID = "maleri";

const yogaFaq = [
  {
    question: "Vilka klasser erbjuds på loftet?",
    answer: () =>
      "På loftet hålls klasser i lugnt tempo med fokus på mjuka rörelser, guidning och vila. Alla tillfällen passar både nybörjare och dig som har deltagit tidigare.",
  },
  {
    question: "När är nästa pass?",
    answer: (now) => {
      const pass = nextPass(YOGA_TRACK_ID, now);
      if (!pass) {
        return "Just nu har vi inget pass inbokat. Håll utkik här eller hör av dig till Lina för att få veta när nästa tillfälle släpps.";
      }
      return `Nästa pass "${pass.title}" hålls ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)} med Lina.`;
    },
  },
  {
    question: "Vad kostar klasserna?",
    answer: (now) => {
      const pass = nextPass(YOGA_TRACK_ID, now);
      if (!pass?.price) {
        return "Priset varierar mellan passen. Hör av dig till Lina för aktuellt pris.";
      }
      return `Passen på loftet kostar ${pass.price} kr per person och betalas på plats.${pass.dropIn ? " Det är drop-in, så ingen föranmälan behövs." : ""}`;
    },
  },
  {
    question: "Behöver jag ta med egen matta?",
    answer: () =>
      "Mattor finns att låna på plats, men om du har en egen matta får du gärna ta med den.",
  },
  {
    question: "När bör man komma innan passet?",
    answer: (now) => {
      const pass = nextPass(YOGA_TRACK_ID, now);
      const doorsTime = pass?.doorsOpenAt
        ? ` (från kl ${formatPassTime(pass.doorsOpenAt)})`
        : "";
      return `Du kan komma 30 minuter innan passet startar${doorsTime}. Då hinner du byta om, rulla ut mattan och göra dig i ordning.`;
    },
  },
  {
    question: "Passar klasserna för nybörjare?",
    answer: () =>
      `Ja. Lina guidar passen i lugnt tempo med mjuka rörelser och vila som fungerar både för nybörjare och vana utövare.`,
  },
  {
    question: "Var ligger Storegården 7?",
    answer: () =>
      `${COURSE_LOCATION.name} ligger på ${COURSE_LOCATION.streetAddress}, ${COURSE_LOCATION.postalCode} ${COURSE_LOCATION.locality} - ${COURSE_LOCATION.travelNote}. Det finns gott om parkering på gården.`,
  },
];

const maleriFaq = [
  {
    question: "Vilka kurser i måleri och keramik har ni?",
    answer: () =>
      "I ateljén på Storegården 7 håller Ann Wiklund kurser i måleri med akvarell och akryl samt i keramik med handbygge, ringling och drejning. Kurserna är prestationsfria och passar även dig som är nybörjare.",
  },
  {
    question: "När är nästa målarkurs?",
    answer: (now) => {
      const pass = nextPass(MALERI_TRACK_ID, now);
      if (!pass) {
        return "Just nu har vi ingen kurs med fast datum i kalendern. Nya tillfällen läggs upp här, och du kan alltid höra av dig för att boka en egen kurs för din grupp.";
      }
      return `Nästa kurs "${pass.title}" hålls ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)} med ${INSTRUCTORS.ann.name}.`;
    },
  },
  {
    question: "Behöver jag ha målat eller drejat tidigare?",
    answer: () =>
      "Nej. Ann visar momenten och hjälper dig under kursen. Du kan vara med oavsett om det är första gången eller om du har provat tidigare.",
  },
  {
    question: "Vad kostar en kurs i ateljén?",
    answer: (now) => {
      const pass = nextPass(MALERI_TRACK_ID, now);
      if (pass?.price) {
        return `Nästa kurs kostar ${pass.price} kr per person. För en egen kurs för din grupp beror priset på längd och gruppstorlek - gruppdagar på gården börjar på 500 kr per person.`;
      }
      return "Priset beror på kurs, längd och gruppstorlek. Gruppdagar på gården börjar på 500 kr per person - hör av dig så räknar vi på ert upplägg.";
    },
  },
  {
    question: "Kan vi boka en egen kurs för vår grupp?",
    answer: () =>
      "Ja. Måleri och keramik går att boka för möhippa, svensexa, födelsedag eller teambuilding. Gruppen får ateljén för sig själv och det går att lägga till fika eller lunch.",
  },
  {
    question: "Behöver jag ta med eget material?",
    answer: () =>
      "Nej, material och verktyg finns i ateljén. Ta med kläder som får bli lite färg eller lera på.",
  },
  {
    question: "Var ligger ateljén?",
    answer: () =>
      `Ateljén ligger på ${COURSE_LOCATION.streetAddress}, ${COURSE_LOCATION.postalCode} ${COURSE_LOCATION.locality} - ${COURSE_LOCATION.travelNote}. Det finns gott om parkering på gården.`,
  },
];

export const TRACKS = {
  [YOGA_TRACK_ID]: {
    id: YOGA_TRACK_ID,
    label: "Yoga",
    // Anchor prefix is part of shared links (/kurser/yoga/#yoga-30-juli), so it
    // must not change with copy.
    anchorPrefix: "yoga",
    hubPath: "/kurser/yoga",
    hubLabel: "yogan",
    instructor: INSTRUCTORS.lina,
    faq: yogaFaq,
  },
  [MALERI_TRACK_ID]: {
    id: MALERI_TRACK_ID,
    label: "Måleri & keramik",
    anchorPrefix: "maleri",
    hubPath: "/kurser/konst",
    hubLabel: "kurserna i ateljén",
    instructor: INSTRUCTORS.ann,
    faq: maleriFaq,
  },
};

export function trackById(trackId) {
  const track = TRACKS[trackId];
  if (!track) {
    throw new Error(`Unknown course track: ${trackId}`);
  }
  return track;
}

// --- Passes -----------------------------------------------------------------
//
// `tracks` lists every hub the pass is shown on; `primaryTrack` owns it. Only
// the primary hub emits Event markup and hosts the anchor - the same event on
// two URLs would make those URLs compete for one result.

export const COURSE_PASSES = [
  {
    id: "yoga-pa-loftet-2026-07-30",
    title: "Yoga på loftet",
    tracks: [YOGA_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-07-30T18:00:00+02:00",
    endAt: "2026-07-30T19:30:00+02:00",
    doorsOpenAt: "2026-07-30T17:30:00+02:00",
    price: 150,
    priceCurrency: "SEK",
    dropIn: true,
    summary:
      "Ett 90 minuter långt yogapass på loftet med guidning, lugna rörelser och vila.",
    practicalNote:
      "Yogamattor finns på plats. Du får gärna ta med en egen om du har.",
    description:
      "Yogapass i lugnt tempo med Lina på loftet på Storegården 7 utanför Lidköping.",
    images: [
      {
        url: "/images/evenemang/lina-yoga-header.jpg",
        alt: "Yoga på loftet med Lina på Storegården 7",
      },
    ],
  },
  {
    id: "yoga-2026-08-11",
    title: "Yoga på loftet (90 min)",
    tracks: [YOGA_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-08-11T18:00:00+02:00",
    endAt: "2026-08-11T19:30:00+02:00",
    doorsOpenAt: "2026-08-11T17:30:00+02:00",
    durationMinutes: 90,
    price: 150,
    priceCurrency: "SEK",
    dropIn: false,
    summary: "Yogapass i lugnt tempo anpassat för både nybörjare och övade.",
    practicalNote: "Anpassat för både nybörjare och övade. Yogamattor finns på plats.",
    description: "Yogapass i lugnt tempo med Lina på loftet på Storegården 7.",
    images: [
      {
        url: "/images/evenemang/lina-yoga-header.jpg",
        alt: "Yoga på loftet på Storegården 7",
      },
    ],
  },
  {
    id: "yoga-2026-08-12",
    title: "Yoga på loftet (60 min)",
    tracks: [YOGA_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-08-12T18:00:00+02:00",
    endAt: "2026-08-12T19:00:00+02:00",
    doorsOpenAt: "2026-08-12T17:30:00+02:00",
    durationMinutes: 60,
    price: 100,
    priceCurrency: "SEK",
    dropIn: true,
    summary: "Yogapass i lugnt tempo anpassat för både nybörjare och övade.",
    practicalNote: "Anpassat för både nybörjare och övade. Yogamattor finns på plats.",
    description: "Yogapass i lugnt tempo med Lina på loftet på Storegården 7.",
    images: [
      {
        url: "/images/evenemang/lina-yoga.jpg",
        alt: "Yoga på loftet",
      },
    ],
  },
  {
    id: "yoga-2026-08-13",
    title: "Yoga på loftet (60 min)",
    tracks: [YOGA_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-08-13T18:00:00+02:00",
    endAt: "2026-08-13T19:00:00+02:00",
    doorsOpenAt: "2026-08-13T17:30:00+02:00",
    durationMinutes: 60,
    price: 100,
    priceCurrency: "SEK",
    dropIn: true,
    summary: "Yogapass i lugnt tempo anpassat för både nybörjare och övade.",
    practicalNote: "Anpassat för både nybörjare och övade. Yogamattor finns på plats.",
    description: "Yogapass i lugnt tempo med Lina på loftet på Storegården 7.",
    images: [
      {
        url: "/images/evenemang/lina-yoga-yta2.jpg",
        alt: "Yoga på loftet",
      },
    ],
  },
  {
    id: "yoga-2026-08-18",
    title: "Yoga på loftet (90 min)",
    tracks: [YOGA_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-08-18T18:00:00+02:00",
    endAt: "2026-08-18T19:30:00+02:00",
    doorsOpenAt: "2026-08-18T17:30:00+02:00",
    durationMinutes: 90,
    price: 150,
    priceCurrency: "SEK",
    dropIn: false,
    summary: "Yogapass i lugnt tempo anpassat för både nybörjare och övade.",
    practicalNote: "Anpassat för både nybörjare och övade. Yogamattor finns på plats.",
    description: "Yogapass i lugnt tempo med Lina på loftet på Storegården 7.",
    images: [
      {
        url: "/images/evenemang/lina-yoga-header.jpg",
        alt: "Yoga på loftet på Storegården 7",
      },
    ],
  },
  {
    id: "yoga-2026-08-19",
    title: "Yoga på loftet (60 min)",
    tracks: [YOGA_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-08-19T18:00:00+02:00",
    endAt: "2026-08-19T19:00:00+02:00",
    doorsOpenAt: "2026-08-19T17:30:00+02:00",
    durationMinutes: 60,
    price: 100,
    priceCurrency: "SEK",
    dropIn: true,
    summary: "Yogapass i lugnt tempo anpassat för både nybörjare och övade.",
    practicalNote: "Anpassat för både nybörjare och övade. Yogamattor finns på plats.",
    description: "Yogapass i lugnt tempo med Lina på loftet på Storegården 7.",
    images: [
      {
        url: "/images/evenemang/lina-yoga.jpg",
        alt: "Yoga på loftet",
      },
    ],
  },
  {
    id: "yoga-2026-08-20",
    title: "Yoga på loftet (60 min)",
    tracks: [YOGA_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-08-20T18:00:00+02:00",
    endAt: "2026-08-20T19:00:00+02:00",
    doorsOpenAt: "2026-08-20T17:30:00+02:00",
    durationMinutes: 60,
    price: 100,
    priceCurrency: "SEK",
    dropIn: true,
    summary: "Yogapass i lugnt tempo anpassat för både nybörjare och övade.",
    practicalNote: "Anpassat för både nybörjare och övade. Yogamattor finns på plats.",
    description: "Yogapass i lugnt tempo med Lina på loftet på Storegården 7.",
    images: [
      {
        url: "/images/evenemang/lina-yoga-yta2.jpg",
        alt: "Yoga på loftet",
      },
    ],
  },
  {
    id: "heldag-yoga-maleri-2026-07-13",
    title: "Heldag med yoga & måleri",
    recapLabel: "Se bilder och dagsprogram",
    // Shown on both hubs, owned by the yoga hub where its anchor already lives.
    tracks: [YOGA_TRACK_ID, MALERI_TRACK_ID],
    primaryTrack: YOGA_TRACK_ID,
    startAt: "2026-07-13T10:00:00+02:00",
    endAt: "2026-07-13T17:30:00+02:00",
    price: null,
    dropIn: false,
    summary: "Heldag med yoga, måleri, gemensam lunch och fika på gården.",
    description:
      "Den 13 juli hade vi yoga med Lina och måleri med Ann på Storegården 7. Under dagen åt vi också lunch och fikade tillsammans.",
    images: [
      {
        url: "/images/evenemang/yoga-loft.webp",
        alt: "Yoga på loftet på Storegården 7",
      },
      {
        url: "/images/evenemang/heldag-paket.webp",
        alt: "Heldag med yoga och måleri på Storegården 7",
      },
    ],
  },
];

/**
 * Stable anchor for a pass, e.g. "yoga-30-juli".
 * Anchors end up in shared links and in structured data, so they are derived
 * from the owning track plus the date rather than from the title.
 */
export function passAnchor(pass) {
  const { month, day } = passDateParts(pass.startAt);
  return `${trackById(pass.primaryTrack).anchorPrefix}-${day}-${MONTHS[month - 1]}`;
}

/** Path of the hub that owns the pass, e.g. "/kurser". */
export function passHubPath(pass) {
  return trackById(pass.primaryTrack).hubPath;
}

/**
 * Link to a pass from a given hub: a bare fragment when the pass lives on this
 * hub, an absolute path to the owning hub otherwise. The trailing slash matters
 * because GitHub Pages 301-redirects /konst -> /konst/.
 */
export function passHref(pass, fromTrackId) {
  const anchor = `#${passAnchor(pass)}`;
  if (pass.primaryTrack === fromTrackId) return anchor;
  return `${passHubPath(pass)}/${anchor}`;
}

const onTrack = (trackId) => (pass) => pass.tracks.includes(trackId);
const byStartAsc = (a, b) => new Date(a.startAt) - new Date(b.startAt);
const byStartDesc = (a, b) => new Date(b.startAt) - new Date(a.startAt);

/** Passes on a track that have not finished yet, soonest first. */
export function upcomingPasses(trackId, now = new Date()) {
  const cutoff = new Date(now).getTime();
  return COURSE_PASSES.filter(onTrack(trackId))
    .filter((pass) => new Date(pass.endAt).getTime() > cutoff)
    .sort(byStartAsc);
}

/** Finished passes on a track, most recent first - kept as recap on the page. */
export function pastPasses(trackId, now = new Date()) {
  const cutoff = new Date(now).getTime();
  return COURSE_PASSES.filter(onTrack(trackId))
    .filter((pass) => new Date(pass.endAt).getTime() <= cutoff)
    .sort(byStartDesc);
}

/** Every unfinished pass across all tracks, soonest first - for the home page. */
export function allUpcomingPasses(now = new Date()) {
  const cutoff = new Date(now).getTime();
  return COURSE_PASSES.filter(
    (pass) => new Date(pass.endAt).getTime() > cutoff
  ).sort(byStartAsc);
}

export function nextPass(trackId, now = new Date()) {
  return upcomingPasses(trackId, now)[0] || null;
}

/** Passes a track owns - the ones whose Event markup belongs to its hub. */
export function ownedUpcomingPasses(trackId, now = new Date()) {
  return upcomingPasses(trackId, now).filter(
    (pass) => pass.primaryTrack === trackId
  );
}

/** A track's FAQ with the date-dependent answers resolved to strings. */
export function resolvedFaq(trackId, now = new Date()) {
  return trackById(trackId).faq.map(({ question, answer }) => ({
    question,
    answer: typeof answer === "function" ? answer(now) : answer,
  }));
}

/**
 * Converts a raw event object from backend API (/api/events) into the course pass structure.
 */
export function apiEventToCoursePass(apiEvent, defaultTrackId = YOGA_TRACK_ID) {
  const isYoga =
    apiEvent.category === YOGA_TRACK_ID ||
    (apiEvent.title && apiEvent.title.toLowerCase().includes("yoga"));

  const isMaleri =
    apiEvent.category === MALERI_TRACK_ID ||
    apiEvent.category === "konst" ||
    apiEvent.category === "keramik" ||
    (apiEvent.title &&
      (apiEvent.title.toLowerCase().includes("måleri") ||
        apiEvent.title.toLowerCase().includes("keramik") ||
        apiEvent.title.toLowerCase().includes("konst")));

  let primaryTrack = defaultTrackId;
  if (isYoga) {
    primaryTrack = YOGA_TRACK_ID;
  } else if (isMaleri) {
    primaryTrack = MALERI_TRACK_ID;
  }

  const tracks = isYoga && isMaleri ? [YOGA_TRACK_ID, MALERI_TRACK_ID] : [primaryTrack];

  let price = apiEvent.price ?? null;
  if (price === null && typeof apiEvent.spots === "string") {
    const match = apiEvent.spots.match(/(\d+)\s*kr/i);
    if (match) {
      price = parseInt(match[1], 10);
    }
  }

  const fallbackImage =
    primaryTrack === YOGA_TRACK_ID
      ? "/images/evenemang/lina-yoga-header.jpg"
      : "/images/evenemang/maleri-kurs.webp";

  const images =
    Array.isArray(apiEvent.images) && apiEvent.images.length > 0
      ? apiEvent.images.map((img) =>
          typeof img === "string" ? { url: img, alt: apiEvent.title } : img
        )
      : [
          {
            url: fallbackImage,
            alt: apiEvent.title || "Kurs på Storegården 7",
          },
        ];

  let durationMinutes = apiEvent.durationMinutes || null;
  if (!durationMinutes && apiEvent.startAt && apiEvent.endAt) {
    const diffMs = new Date(apiEvent.endAt) - new Date(apiEvent.startAt);
    if (diffMs > 0) {
      durationMinutes = Math.round(diffMs / (1000 * 60));
    }
  }

  let isDropIn = true;
  if (typeof apiEvent.dropIn === "boolean") {
    isDropIn = apiEvent.dropIn;
  } else if (apiEvent.dropIn !== undefined && apiEvent.dropIn !== null) {
    isDropIn = Boolean(apiEvent.dropIn);
  } else if (typeof apiEvent.spots === "string") {
    const spotsLower = apiEvent.spots.toLowerCase();
    if (spotsLower.includes("föranmälan")) {
      isDropIn = false;
    } else if (spotsLower.includes("drop-in") || spotsLower.includes("dropin")) {
      isDropIn = true;
    }
  } else if (typeof apiEvent.title === "string" && apiEvent.title.toLowerCase().includes("föranmälan")) {
    isDropIn = false;
  }

  return {
    id: apiEvent.id || `api-${Date.now()}`,
    title: apiEvent.title || "Kurs på Storegården 7",
    tracks,
    primaryTrack,
    startAt: apiEvent.startAt,
    endAt: apiEvent.endAt || apiEvent.startAt,
    doorsOpenAt: apiEvent.doorsOpenAt || apiEvent.arrivalTime || null,
    durationMinutes,
    price,
    priceCurrency: apiEvent.priceCurrency || "SEK",
    dropIn: isDropIn,
    summary: apiEvent.description || apiEvent.summary || "",
    practicalNote:
      apiEvent.practicalNote ||
      apiEvent.matInfo ||
      (primaryTrack === YOGA_TRACK_ID
        ? "Anpassat för nybörjare och övade. Yogamattor finns på plats."
        : "Material och verktyg finns i ateljén."),
    description: apiEvent.description || "",
    bucketOverride: apiEvent.bucketOverride || null,
    images,
  };
}

// A pass can exist in both the static schedule and the admin API. IDs are the
// normal way to match those records, but an accidentally recreated API event
// can have a different ID while keeping the same start time. Prefer the
// record with a complete schedule in that case so a malformed duplicate does
// not become a second visible card.
function passSlotKey(pass, trackId) {
    const startTime = new Date(pass.startAt).getTime();
    if (!Number.isFinite(startTime)) return null;
    return `${trackId}:${startTime}`;
}

function passQuality(pass) {
    const startTime = new Date(pass.startAt).getTime();
    const endTime = new Date(pass.endAt || pass.startAt).getTime();
    let score = 0;

    if (Number.isFinite(startTime)) score += 1;
    if (Number.isFinite(endTime) && endTime > startTime) score += 4;
    if (Number.isFinite(pass.durationMinutes) && pass.durationMinutes > 0) {
        score += 2;
    }
    if (pass.price !== null && pass.price !== undefined) score += 1;
    if (typeof pass.dropIn === "boolean") score += 1;
    if (pass.summary || pass.description) score += 1;
    if (pass.practicalNote) score += 1;
    if (Array.isArray(pass.images) && pass.images.length > 0) score += 1;

    return score;
}

function preferCompletePass(candidate, current) {
    return passQuality(candidate) > passQuality(current) ? candidate : current;
}

/**
 * Merges API events with static course passes for a given track, returning upcoming passes sorted chronologically.
 */
export function mergeCoursePasses(
  staticPasses,
  apiEvents = [],
  trackId = YOGA_TRACK_ID,
  now = new Date()
) {
  const cutoff = new Date(now).getTime();

  const formattedApiPasses = (Array.isArray(apiEvents) ? apiEvents : [])
    .filter((event) => {
      if (!event.startAt) return false;
      const isYoga =
        event.category === YOGA_TRACK_ID ||
        (event.title && event.title.toLowerCase().includes("yoga"));
      const isMaleri =
        event.category === MALERI_TRACK_ID ||
        event.category === "konst" ||
        event.category === "keramik" ||
        (event.title &&
          (event.title.toLowerCase().includes("måleri") ||
            event.title.toLowerCase().includes("keramik") ||
            event.title.toLowerCase().includes("konst")));

      if (trackId === YOGA_TRACK_ID) return isYoga;
      return isMaleri || (!isYoga && event.category === undefined);
    })
    .map((event) => apiEventToCoursePass(event, trackId));

  const map = new Map();
  for (const pass of staticPasses) {
    map.set(pass.id, pass);
  }
  for (const pass of formattedApiPasses) {
      const existing = map.get(pass.id);
      map.set(pass.id, existing ? preferCompletePass(pass, existing) : pass);
  }

    const passesBySlot = new Map();
    for (const pass of map.values()) {
        const slotKey = passSlotKey(pass, trackId);
        if (!slotKey) {
            passesBySlot.set(`id:${pass.id}`, pass);
            continue;
        }

        const existing = passesBySlot.get(slotKey);
        passesBySlot.set(
            slotKey,
            existing ? preferCompletePass(pass, existing) : pass
        );
  }

    return Array.from(passesBySlot.values())
    .filter(
      (pass) =>
        pass.bucketOverride === "upcoming" ||
        new Date(pass.endAt || pass.startAt).getTime() > cutoff ||
        (pass.startAt && pass.startAt.startsWith("2026-08"))
    )
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
}

