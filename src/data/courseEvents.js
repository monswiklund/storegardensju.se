// The course hubs' model: tracks, instructors, FAQ and the passes on them.
//
// Consumed by places that must never disagree:
//   - src/pages/KurserPage.jsx  (the yoga hub, /kurser/yoga)
//   - src/pages/ArtPage.jsx     (the maleri hub, /kurser/konst)
//   - src/config/seoMeta.js     (Event/Course/FAQPage JSON-LD + prerender copy)
//   - scripts/generate-route-pages.js (indirectly, via seoMeta)
//
// Two hubs, one per subject, under a /kurser index: /kurser/yoga targets
// "yoga i Lidköping" and /kurser/konst targets "målarkurs i Lidköping". Those
// are different searches, so they get different URLs - but the same machinery.
// A pass is a section with an anchor on its hub rather than its own URL: one
// pass a month would otherwise produce a pile of thin pages that go stale the
// day after, splitting link equity instead of accumulating it.
//
// Passes come only from the CMS (events, and the older course-passes). The
// build exports them into cmsContent.generated.js (COURSE_PASSES below, used by
// the prerender and as the browser's fallback); the hubs replace that with a
// complete live answer (schedulePasses on fetchCmsSchedule's result). Every
// selector takes the list it works on, so both run through the same rules.

import { cdnAsset } from "../config/cdnAssets.js";
import { contactEmail } from "../features/contact/contact.js";
import CMS_CONTENT from "./cmsContent.generated.js";
import { isUpcoming, knownEndTimeOf, startTimeOf } from "./schedulePlacement.js";

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

// One shared inbox for the farm - both instructors are reached there, and the
// course pages send sign-ups through the farm's enquiry form to the same place.
const CONTACT_EMAIL = contactEmail;

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
    bio: "Ann Wiklund är konstnär och keramiker och håller kurserna i ateljén på Storegården 7. Hon undervisar i akvarell och akryl. Du behöver inte ha målat tidigare.",
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

// Payload stores UTC ("…T16:00:00.000Z") while the static schedule carries
// +02:00, so every date and time is read on the farm's clock (Europe/Stockholm)
// rather than from the string or the reader's timezone - a pass at 18:00 reads
// "18:00" in Sydney too, whichever source it came from.
const stockholmFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function passDateParts(isoString) {
  const parts = Object.fromEntries(
    stockholmFormat
      .formatToParts(new Date(isoString))
      .map(({ type, value }) => [type, value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    time: `${parts.hour}:${parts.minute}`,
  };
}

/** "Torsdag 30 juli" - used in headings, badges and prerendered copy. */
export function formatPassDate(pass) {
  const { year, month, day } = passDateParts(pass.startAt);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday} ${day} ${MONTHS[month - 1]}`;
}

/** "18:00" on the farm's clock. */
export function formatPassTime(isoString) {
  if (!isoString || !Number.isFinite(new Date(isoString).getTime())) return "";
  return passDateParts(isoString).time;
}

/** Calendar year of the pass on the farm's clock. */
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
    answer: (now, passes) => {
      const pass = nextPass(YOGA_TRACK_ID, now, passes);
      if (!pass) {
        return "Just nu har vi inget pass inbokat. Håll utkik här eller hör av dig till Lina för att få veta när nästa tillfälle släpps.";
      }
      return `Nästa pass "${pass.title}" hålls ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)} med Lina.`;
    },
  },
  {
    question: "Vad kostar klasserna?",
    answer: (now, passes) => {
      const pass = nextPass(YOGA_TRACK_ID, now, passes);
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
    answer: (now, passes) => {
      const pass = nextPass(YOGA_TRACK_ID, now, passes);
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
    question: "Vilka kurser i måleri har ni?",
    answer: () =>
      "I ateljén på Storegården 7 håller Ann Wiklund kurser i måleri med akvarell och akryl. Kurserna är prestationsfria och passar även dig som är nybörjare.",
  },
  {
    question: "När är nästa kurs i måleri?",
    answer: (now, passes) => {
      const pass = nextPass(MALERI_TRACK_ID, now, passes);
      if (!pass) {
        return "Just nu har vi ingen kurs med fast datum i kalendern. Nya tillfällen läggs upp här, och du kan alltid höra av dig för att boka en egen kurs för din grupp.";
      }
      return `Nästa kurs "${pass.title}" hålls ${formatPassDate(pass).toLowerCase()} kl ${formatPassTime(pass.startAt)} med ${INSTRUCTORS.ann.name}.`;
    },
  },
  {
    question: "Behöver jag ha målat tidigare?",
    answer: () =>
      "Nej. Ann visar momenten och hjälper dig under kursen. Du kan vara med oavsett om det är första gången eller om du har provat tidigare.",
  },
  {
    question: "Vad kostar en kurs i ateljén?",
    answer: (now, passes) => {
      const pass = nextPass(MALERI_TRACK_ID, now, passes);
      if (pass?.price) {
        return `Nästa kurs kostar ${pass.price} kr per person. För en egen kurs för din grupp beror priset på längd och gruppstorlek - gruppdagar på gården börjar på 500 kr per person.`;
      }
      return "Priset beror på kurs, längd och gruppstorlek. Gruppdagar på gården börjar på 500 kr per person - hör av dig så räknar vi på ert upplägg.";
    },
  },
  {
    question: "Kan vi boka en egen kurs för vår grupp?",
    answer: () =>
      "Ja. Måleri går att boka för möhippa, svensexa, födelsedag eller teambuilding. Gruppen får ateljén för sig själv och det går att lägga till fika eller lunch.",
  },
  {
    question: "Behöver jag ta med eget material?",
    answer: () =>
      "Nej, material och verktyg finns i ateljén. Ta med kläder som får bli lite färg på.",
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
    pageSlug: "yoga",
    instructor: INSTRUCTORS.lina,
    practicalNote: "Anpassat för nybörjare och övade. Yogamattor finns på plats.",
    faq: yogaFaq,
  },
  [MALERI_TRACK_ID]: {
    id: MALERI_TRACK_ID,
    label: "Måleri",
    anchorPrefix: "maleri",
    hubPath: "/kurser/konst",
    hubLabel: "kurserna i ateljén",
    pageSlug: "art",
    instructor: INSTRUCTORS.ann,
    practicalNote: "Material och verktyg finns i ateljén.",
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
const byStartAsc = (a, b) => startTimeOf(a) - startTimeOf(b);
const byStartDesc = (a, b) => startTimeOf(b) - startTimeOf(a);

/** Passes on a track that have not finished yet, soonest first (placement: schedulePlacement.js). */
export function upcomingPasses(trackId, now = new Date(), passes = COURSE_PASSES) {
  return passes.filter(onTrack(trackId)).filter((pass) => isUpcoming(pass, now)).sort(byStartAsc);
}

/** Finished passes on a track, most recent first - kept as recap on the page. */
export function pastPasses(trackId, now = new Date(), passes = COURSE_PASSES) {
  return passes.filter(onTrack(trackId)).filter((pass) => !isUpcoming(pass, now)).sort(byStartDesc);
}

/** Every unfinished pass across all tracks, soonest first - for the notification bell. */
export function allUpcomingPasses(now = new Date(), passes = COURSE_PASSES) {
  return passes.filter((pass) => isUpcoming(pass, now)).sort(byStartAsc);
}

/** The next pass that will take place: a cancelled one is not "the next pass". */
export function nextPass(trackId, now = new Date(), passes = COURSE_PASSES) {
  return upcomingPasses(trackId, now, passes).find((pass) => pass.status !== "cancelled") || null;
}

/** Passes a track owns - the ones whose Event markup belongs to its hub. */
export function ownedUpcomingPasses(trackId, now = new Date(), passes = COURSE_PASSES) {
  return upcomingPasses(trackId, now, passes).filter((pass) => pass.primaryTrack === trackId);
}

/** Whether a visitor can still sign up: it has not started, is not cancelled and not full. */
export function isBookablePass(pass, now = new Date()) {
  const start = startTimeOf(pass);
  return start !== null && start > new Date(now).getTime() && isUpcoming(pass, now) &&
    pass.status !== "cancelled" && pass.status !== "fully_booked";
}

/** A track's FAQ with the date-dependent answers resolved to strings. */
export function resolvedFaq(trackId, now = new Date(), passes = COURSE_PASSES) {
  return trackById(trackId).faq.map(({ question, answer }) => ({
    question,
    answer: typeof answer === "function" ? answer(now, passes) : answer,
  }));
}

/**
 * The FAQ a hub shows and declares in FAQPage markup: the editors' list when the page has one
 * (also an emptied one), else the track's own answers resolved against the schedule.
 */
export function hubFaq(trackId, now = new Date(), passes = COURSE_PASSES, cmsFaq = null) {
  if (Array.isArray(cmsFaq)) {
    return cmsFaq.filter((item) => item?.title && item?.body).map(({ title, body }) => ({ question: title, answer: body }));
  }
  return resolvedFaq(trackId, now, passes);
}

/** The instructor named on a pass, or null for a guest (no name is invented for them). */
export function passInstructor(pass) {
  return INSTRUCTORS[pass.instructorId] || null;
}


// Combined days filed under a single category before the CMS could put one event on two hubs.
// Transitional and limited to these records: remove an entry once its pass is no longer shown in
// the recap, or once events get an explicit "also on hub" field. Titles never decide a hub.
const LEGACY_SHARED_EVENTS = Object.freeze({
  "course:heldag-yoga-maleri-2026-07-13": [YOGA_TRACK_ID, MALERI_TRACK_ID],
});

/** Hubs a CMS event belongs to, decided by its category (keramik courses are not on the hubs). */
export function eventTracks(event) {
  const legacy = LEGACY_SHARED_EVENTS[event?.legacyId];
  if (legacy) return legacy;
  if (event?.category === "yoga") return [YOGA_TRACK_ID];
  if (event?.category === "konst") return [MALERI_TRACK_ID];
  return [];
}

/** Hubs a course pass belongs to, decided by its track. */
export function coursePassTracks(coursePass) {
  if (coursePass?.track === "yoga") return [YOGA_TRACK_ID];
  if (coursePass?.track === "konst") return [MALERI_TRACK_ID];
  return [];
}

const INSTRUCTOR_BY_TRACK = { [YOGA_TRACK_ID]: "lina", [MALERI_TRACK_ID]: "ann" };

const trackImage = (trackId, title) => ({
  url: cdnAsset(trackId === YOGA_TRACK_ID ? "/images/evenemang/lina-yoga-header.jpg" : "/images/evenemang/maleri-kurs.webp"),
  alt: title || "Kurs på Storegården 7",
});

const durationOf = (item) => {
  if (item.durationMinutes > 0) return item.durationMinutes;
  const start = startTimeOf(item);
  const end = knownEndTimeOf(item);
  return start !== null && end !== null && end > start ? Math.round((end - start) / 60_000) : null;
};

/**
 * A projected CMS event (cmsProjection.projectEvent) as a pass. Every value comes from the event
 * or from its track; nothing is merged in from another source, so a value the editor emptied
 * stays empty.
 */
export function eventToPass(event) {
  const tracks = eventTracks(event);
  const primaryTrack = tracks[0] || null;
  const media = (event.media || []).map((item) => ({
    url: item.sizes?.card?.url || item.url,
    alt: item.alt || event.title,
  })).filter((image) => image.url);
  const legacyImages = (event.images || []).map((image) => ({ url: image.url, alt: image.alt || event.title }));
  const images = media.length > 0 ? media : legacyImages.length > 0 ? legacyImages
    : event.mediaMigrated || !primaryTrack ? [] : [trackImage(primaryTrack, event.title)];

  return {
    // Shared links (?pastEvent=…) already use the legacy id, so it stays the id where it exists.
    id: event.legacyId || `events:${event.id}`,
    // Explicit link from a migrated record to the hand-written recap it replaced (featuredPastEvents.js).
    legacyKey: event.legacyId ? event.legacyId.replace(/^course:/, "") : null,
    source: "events",
    title: event.title,
    tracks,
    primaryTrack,
    startAt: event.startAt,
    endAt: event.endAt,
    doorsOpenAt: null,
    durationMinutes: durationOf(event),
    price: event.price,
    priceCurrency: "SEK",
    dropIn: event.dropIn,
    status: "scheduled",
    spots: event.spots,
    instructorId: primaryTrack ? INSTRUCTOR_BY_TRACK[primaryTrack] : null,
    bookingEmail: null,
    location: event.location,
    links: event.links || [],
    summary: event.description,
    description: event.description,
    practicalNote: primaryTrack ? TRACKS[primaryTrack].practicalNote : "",
    bucketOverride: event.bucketOverride,
    images,
    updatedAt: event.updatedAt,
  };
}

/** A projected course pass (cmsProjection.projectCoursePass) as a pass; keeps status, instructor and booking address. */
export function coursePassToPass(coursePass) {
  const tracks = coursePassTracks(coursePass);
  const primaryTrack = tracks[0] || null;
  return {
    id: `course-pass-${coursePass.id}`,
    legacyKey: null,
    source: "course-passes",
    title: coursePass.title,
    tracks,
    primaryTrack,
    startAt: coursePass.startAt,
    endAt: coursePass.endAt,
    doorsOpenAt: null,
    durationMinutes: durationOf(coursePass),
    price: coursePass.price,
    priceCurrency: "SEK",
    dropIn: null,
    status: coursePass.status,
    spots: coursePass.spots,
    instructorId: coursePass.instructor === "guest" ? null : coursePass.instructor,
    bookingEmail: coursePass.bookingEmail,
    location: null,
    links: [],
    summary: coursePass.description,
    description: coursePass.description,
    practicalNote: primaryTrack ? TRACKS[primaryTrack].practicalNote : "",
    bucketOverride: null,
    images: primaryTrack ? [trackImage(primaryTrack, coursePass.title)] : [],
    updatedAt: coursePass.updatedAt,
  };
}

/** Passes on the hubs from one schedule ({ events, coursePasses }) - never a union of sources. */
export function schedulePasses(schedule) {
  return [
    ...(schedule?.events || []).map(eventToPass),
    ...(schedule?.coursePasses || []).map(coursePassToPass),
  ].filter((pass) => pass.tracks.length > 0 && startTimeOf(pass) !== null);
}

// What the build exported (empty without an export). The prerender and JSON-LD read it, and the
// hubs show it until a complete live answer replaces it.
export const COURSE_PASSES = schedulePasses(CMS_CONTENT);
