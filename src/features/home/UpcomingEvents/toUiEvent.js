import { getPageCopySync } from "../../../hooks/usePageCopy.js";
import {
  commonHours,
  dayRange,
  multiDayTime,
  remainingSessions,
  scheduleSessions,
  sessionsOf,
  weekdaysOf,
} from "../../../data/eventSeries.js";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = date.toLocaleDateString("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [day, month, year] = formatted.split(" ");
  if (!day || !month || !year) return formatted;
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * A course that meets several times, as one card: the weekdays and hours it keeps, the sessions
 * still to come (all of them once it is over) and, for the date badge and ordering, the next one.
 */
function seriesFields(allSessions, now, siteCopy) {
  // Called-off days stay in the calendar, struck; dates, counts and "next" come from the rest.
  const held = allSessions.filter((session) => !session.cancelled);
  const sessions = held.length > 0 ? held : allSessions;
  const remaining = remainingSessions(sessions, now);
  const shown = remaining.length > 0 ? remaining : sessions;
  const anchor = remaining[0] || sessions[sessions.length - 1];
  const hours = commonHours(sessions);
  const [first, last] = [sessions[0], sessions[sessions.length - 1]];
  const firstDate = formatDate(first.startAt).split(" ");
  const lastDate = formatDate(last.startAt).split(" ");
  // A finished course within one month reads "7–30 September 2026" in the date column, like the
  // month groups of single yoga classes; otherwise the date is its next (or last) session.
  const finishedInMonth = remaining.length === 0 && firstDate[1] === lastDate[1] && firstDate[2] === lastDate[2];
  return {
    date: finishedInMonth ? `${firstDate[0]}–${lastDate.join(" ")}` : formatDate(anchor.startAt),
    sortAt: anchor.startAt,
    time: [weekdaysOf(sessions), hours].filter(Boolean).join(" · "),
    range: `${dayRange(shown[0].startAt, shown[shown.length - 1].startAt)} · ${shown.length} ${siteCopy ? siteCopy("courses.sessions-suffix") : ""}`.trim(),
    badge: `${sessions.length} ${siteCopy ? siteCopy("courses.sessions-suffix") : ""}`.trim(),
    // Every session, so the calendar can show this week's earlier ones as done.
    sessions: scheduleSessions(allSessions, now),
    isGroupedSeries: true,
  };
}

export const toUiEvent = (item, now = Date.now()) => {
  const startAt = item?.startAt || "";
  const endAt = item?.endAt || "";
  const date = formatDate(startAt);
  const startTime = formatTime(startAt);
  const endTime = formatTime(endAt);
  const siteCopy = getPageCopySync("site");
  const sessions = sessionsOf(item);
  const readMoreLabel = siteCopy ? siteCopy("ui.read-more") : "";

  const mappedImages = (Array.isArray(item?.images) ? item.images : []).map(
    (image) => ({
      ...image,
      src: image.src || image.url || "",
    }),
  );

  let links = Array.isArray(item?.links) ? [...item.links] : [];

  // The category decides which hub an event links to; its title never does.
  const category = item?.category || "ovrigt";
  const hubPath = { yoga: "/kurser/yoga", konst: "/kurser/konst" }[category];
  if (hubPath && (links.length === 0 || links[0]?.href?.startsWith("mailto:"))) {
    links = [{ href: hubPath, label: readMoreLabel }];
  }

  return {
    id: item?.id || "",
    title: item?.title || "",
    category,
    startAt,
    endAt,
    dropIn: Boolean(item?.dropIn),
    status: item?.status || "open",
    price: item?.price,
    durationMinutes: item?.durationMinutes,
    spots: item?.spots || "",
    date,
    sortAt: startAt,
    // Over several days the clock alone ("17:00 - 16:00") reads as running backwards.
    time: multiDayTime(startAt, endAt) || (startTime && endTime ? `${startTime} - ${endTime}` : ""),
    description: item?.description || "",
    moments: Array.isArray(item?.moments) ? item.moments : [],
    artists: item?.artists || "",
    location: item?.location || "",
    links,
    image: mappedImages.length > 0 ? mappedImages[0] : null,
    images: mappedImages,
    ...(sessions.length > 0 ? seriesFields(sessions, now, siteCopy) : {}),
  };
};
