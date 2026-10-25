import { getPageCopySync } from "../../../hooks/usePageCopy.js";

export const PAST_EVENT_CATEGORIES = [
  { id: "all", label: "Alla" },
  { id: "events", label: "Evenemang & Marknad" },
  { id: "courses", label: "Kurser & Workshops" },
  { id: "yoga", label: "Yoga" },
];

/**
 * Checks whether an event matches a selected category filter.
 */
export function eventMatchesCategory(event, categoryId) {
  if (!categoryId || categoryId === "all") return true;

  // The editor's category decides; words in the title or description do not.
  const cat = (event?.category || "").toLowerCase();
  const isYoga = cat === "yoga" || Boolean(event?.isGroupedSeries);
  const isCourse = ["konst", "keramik", "maleri", "workshop"].includes(cat);
  const isEvent = !isYoga && !isCourse;

  if (categoryId === "yoga") return isYoga;
  if (categoryId === "courses") return isCourse;
  if (categoryId === "events") return isEvent;

  return true;
}

const durationMinutes = (event) => {
  if (event.durationMinutes > 0) return event.durationMinutes;
  const start = new Date(event.startAt || "").getTime();
  const end = new Date(event.endAt || "").getTime();
  return Number.isFinite(start) && Number.isFinite(end) && end > start ? (end - start) / 60_000 : 0;
};

/**
 * Consolidates recurring passes (e.g. daily/weekly yoga sessions) into clean representative series cards.
 */
export function groupPastEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const yogaMonthlyGroups = new Map();
  const otherEvents = [];

  for (const event of events) {
    // A series is the yoga classes of one month. A day with a programme, or one that runs four
    // hours or more, is not a class and keeps its own card.
    const isYoga = (event.category || "").toLowerCase() === "yoga";
    const isSpecialEvent =
      (Array.isArray(event.moments) && event.moments.length > 0) || durationMinutes(event) >= 240;

    // A course entered as one event with its sessions is already one card.
    if (isYoga && !isSpecialEvent && !event.isGroupedSeries) {
      let yearMonth = "";
      if (event.startAt) {
        const d = new Date(event.startAt);
        if (!Number.isNaN(d.getTime())) {
          // sv-SE gives "2026-08-01"; the month is taken on the farm's clock.
          yearMonth = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" }).slice(0, 7);
        }
      }
      if (!yearMonth) {
        const parts = (event.date || "").split(" ");
        yearMonth = `${parts[2] || "year"}-${parts[1] || "month"}`;
      }

      if (!yogaMonthlyGroups.has(yearMonth)) {
        yogaMonthlyGroups.set(yearMonth, []);
      }
      yogaMonthlyGroups.get(yearMonth).push(event);
    } else {
      otherEvents.push(event);
    }
  }

  const groupedResults = [];

  for (const [yearMonth, sessions] of yogaMonthlyGroups.entries()) {
    if (sessions.length >= 2) {
      // Sort sessions descending by start date
      sessions.sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0));

      const firstSession = sessions[0];
      const days = sessions
        .map((s) => (s.date || "").split(" ")[0])
        .filter(Boolean)
        .reverse();

      const monthYearParts = (firstSession.date || "").split(" ").slice(1).join(" ");
      const numericDays = days.map(Number).filter((n) => !Number.isNaN(n));
      const dayRange =
        numericDays.length > 0
          ? `${Math.min(...numericDays)}–${Math.max(...numericDays)}`
          : days.join(", ");

      const primaryImage =
        sessions.find((s) => s.image?.src || s.images?.[0]?.src)?.image ||
        sessions.find((s) => s.images?.[0]?.src)?.images?.[0] ||
        firstSession.image;

      // Unique images collected across all sessions in this group
      const combinedImages = [];
      const seenSources = new Set();
      for (const session of sessions) {
        const sessionImages = session.images || (session.image ? [session.image] : []);
        for (const img of sessionImages) {
          if (img?.src && !seenSources.has(img.src)) {
            seenSources.add(img.src);
            combinedImages.push(img);
          }
        }
      }

      const siteCopy = getPageCopySync("site");
      groupedResults.push({
        id: `yoga-series-${yearMonth}`,
        title: siteCopy ? siteCopy("courses.yoga-series-title") : "",
        date: dayRange && monthYearParts ? `${dayRange} ${monthYearParts}` : firstSession.date,
        time: siteCopy ? siteCopy("courses.yoga-series-time") : "",
        badge: `${sessions.length} ${siteCopy ? siteCopy("courses.sessions-suffix") : ""}`,
        location: firstSession.location || "",
        description: siteCopy ? siteCopy("courses.yoga-series-description") : "",
        category: "yoga",
        startAt: firstSession.startAt,
        endAt: firstSession.endAt,
        links: [
          {
            href: "/kurser/yoga",
            label: siteCopy ? siteCopy("ui.read-more") : "",
          },
        ],
        image: primaryImage,
        images: combinedImages.length > 0 ? combinedImages : (primaryImage ? [primaryImage] : []),
        isGroupedSeries: true,
        sessions: [...sessions].reverse(), // chronological list
      });
    } else {
      groupedResults.push(...sessions);
    }
  }

  return [...otherEvents, ...groupedResults].sort((a, b) => {
    const timeA = new Date(a.sortAt || a.startAt || 0).getTime();
    const timeB = new Date(b.sortAt || b.startAt || 0).getTime();
    return timeB - timeA;
  });
}

/** What kind of thing it was, in a word, from the editor's category. */
export function pastEventType(event) {
  if (eventMatchesCategory(event, "yoga")) return "Yoga";
  if (eventMatchesCategory(event, "courses")) return "Kurs";
  return "Evenemang";
}

const yearOf = (event) => {
  const date = new Date(event.sortAt || event.startAt || "");
  if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric" });
  return (event.date || "").split(" ")[2] || "";
};

/** Events (newest first) under their year: [{ year, events }]. */
export function pastYearGroups(events) {
  const groups = [];
  for (const event of events) {
    const year = yearOf(event);
    if (groups.at(-1)?.year !== year) groups.push({ year, events: [] });
    groups.at(-1).events.push(event);
  }
  return groups;
}

/** Up to `limit` different photos, newest event first, each with the event it shows. */
export function bandImages(events, limit = 4) {
  const seen = new Set();
  const band = [];
  for (const event of events) {
    const image = [...(event.images || []), event.image].find((candidate) => candidate?.src && !seen.has(candidate.src));
    if (!image) continue;
    seen.add(image.src);
    band.push({ image, event });
    if (band.length === limit) break;
  }
  return band;
}
