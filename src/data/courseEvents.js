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
  postalCode: "531 96",
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
    bio: "Lina Wiklund är utbildad yogainstruktör och håller yogan på loftet. Hon arbetar också med planering, event och design på Storegården 7. Passen går i lugnt tempo och passar både dig som är nybörjare och dig som har yogat länge.",
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
    question: "När är nästa yoga på Storegården 7?",
    answer: (now) => {
      const pass = nextPass(YOGA_TRACK_ID, now);
      if (!pass) {
        return "Just nu har vi inget yogapass inbokat. Håll utkik här eller hör av dig till Lina för att få veta när nästa tillfälle släpps.";
      }
      return `Nästa yogapass "${pass.title}" hålls ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)} med ${INSTRUCTORS.lina.name}.`;
    },
  },
  {
    question: "Vad kostar yogan på Storegården 7?",
    answer: (now) => {
      const pass = nextPass(YOGA_TRACK_ID, now);
      if (!pass?.price) {
        return "Priset varierar mellan passen. Hör av dig till Lina för aktuellt pris.";
      }
      return `Yoga på loftet kostar ${pass.price} kr per person och betalas på plats.${pass.dropIn ? " Det är drop-in, så ingen föranmälan behövs." : ""}`;
    },
  },
  {
    question: "Behöver jag ta med egen yogamatta?",
    answer: () =>
      "Yogamattor finns att låna på plats, men om du har en egen matta får du gärna ta med den.",
  },
  {
    question: "När bör man komma till yogan?",
    answer: (now) => {
      const pass = nextPass(YOGA_TRACK_ID, now);
      const doorsTime = pass?.doorsOpenAt
        ? ` (från kl ${formatPassTime(pass.doorsOpenAt)})`
        : "";
      return `Du kan komma 30 minuter innan passet startar${doorsTime}. Då hinner du byta om, rulla ut mattan och göra dig i ordning.`;
    },
  },
  {
    question: "Passar yogan för nybörjare?",
    answer: () =>
      `Ja. ${INSTRUCTORS.lina.name} är utbildad yogainstruktör och håller passen i lugnt tempo med guidning och vila som fungerar både för nybörjare och vana utövare.`,
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
    question: "När är nästa målarkurs på Storegården 7?",
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
      "Yogapass i lugnt tempo med Lina Wiklund på loftet på Storegården 7 utanför Lidköping. Du kan komma 30 minuter innan passet börjar. Yogamattor finns på plats.",
    images: [
      {
        url: "/images/evenemang/lina-yoga-header.jpg",
        alt: "Yoga på loftet med Lina Wiklund på Storegården 7",
      },
      {
        url: "/images/evenemang/lina-yoga.jpg",
        alt: "Yoga på loftet event i Lidköping",
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
