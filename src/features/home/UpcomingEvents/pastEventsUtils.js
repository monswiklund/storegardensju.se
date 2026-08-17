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

  const cat = (event?.category || "").toLowerCase();
  const title = (event?.title || "").toLowerCase();
  const desc = (event?.description || "").toLowerCase();

  const isYoga = Boolean(
    cat === "yoga" ||
      title.includes("yoga") ||
      desc.includes("yoga") ||
      event?.isGroupedSeries
  );

  const isCourse = Boolean(
    cat === "konst" ||
      cat === "keramik" ||
      cat === "maleri" ||
      cat === "workshop" ||
      title.includes("måleri") ||
      title.includes("keramik") ||
      title.includes("kurs") ||
      title.includes("workshop") ||
      desc.includes("måleri") ||
      desc.includes("keramik") ||
      desc.includes("ateljé")
  );

  const isEvent = Boolean(
    cat === "marknad" ||
      cat === "cafe" ||
      cat === "oppet_hus" ||
      cat === "kultur" ||
      cat === "ovrigt" ||
      title.includes("konstafton") ||
      title.includes("kulturrunda") ||
      title.includes("marknad") ||
      title.includes("öppet hus") ||
      title.includes("öppen gård") ||
      title.includes("sommarkväll") ||
      title.includes("konsert") ||
      (!isYoga && !isCourse)
  );

  if (categoryId === "yoga") return isYoga;
  if (categoryId === "courses") return isCourse;
  if (categoryId === "events") return isEvent;

  return true;
}

/**
 * Consolidates recurring passes (e.g. daily/weekly yoga sessions) into clean representative series cards.
 */
export function groupPastEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const yogaMonthlyGroups = new Map();
  const otherEvents = [];

  for (const event of events) {
    const titleLower = (event.title || "").toLowerCase();
    const categoryLower = (event.category || "").toLowerCase();

    // Check if this is a recurring yoga class vs a standout combination event (e.g. "Heldag med yoga & måleri")
    const isYoga = categoryLower === "yoga" || titleLower.includes("yoga");
    const isSpecialEvent =
      titleLower.includes("måleri") ||
      titleLower.includes("konst") ||
      titleLower.includes("keramik") ||
      titleLower.includes("heldag") ||
      (Array.isArray(event.moments) && event.moments.length > 0);

    if (isYoga && !isSpecialEvent) {
      let yearMonth = "";
      if (event.startAt) {
        const d = new Date(event.startAt);
        if (!Number.isNaN(d.getTime())) {
          yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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
    const timeA = new Date(a.startAt || 0).getTime();
    const timeB = new Date(b.startAt || 0).getTime();
    return timeB - timeA;
  });
}
