// A course that meets several times is one CMS event with `sessions`. The home calendar shows it
// as one card, and so do the course hubs; "next pass" and the JSON-LD list each session as its own pass.

const ZONE = "Europe/Stockholm";
const DAY_ORDER = ["mån", "tis", "ons", "tors", "fre", "lör", "sön"];

const valid = (value) => typeof value === "string" && Number.isFinite(new Date(value).getTime());
const parts = (value, options) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("sv-SE", { timeZone: ZONE, ...options })
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  );

/** The sessions of a series, oldest first; empty for an ordinary event (none or a single one). */
export function sessionsOf(event) {
  const sessions = (Array.isArray(event?.sessions) ? event.sessions : []).filter((session) => valid(session?.startAt));
  return sessions.length >= 2 ? [...sessions].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)) : [];
}

const endOf = (session) => new Date(valid(session.endAt) ? session.endAt : session.startAt).getTime();

/** Sessions that have not ended at `now`. */
export const remainingSessions = (sessions, now = Date.now()) =>
  sessions.filter((session) => endOf(session) > new Date(now).getTime());

/** "tis 11 aug" */
export function shortDay(value) {
  const { weekday, day, month } = parts(value, { weekday: "short", day: "numeric", month: "short" });
  return `${weekday} ${day} ${month.replace(".", "")}`;
}

/** "18:00" */
const clock = (value) => {
  const { hour, minute } = parts(value, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${hour}:${minute}`;
};

/** "11–20 aug" within a month, else "30 juli – 20 aug". */
export function dayRange(from, to) {
  const a = parts(from, { day: "numeric", month: "short" });
  const b = parts(to, { day: "numeric", month: "short" });
  const month = (p) => p.month.replace(".", "");
  if (a.day === b.day && a.month === b.month) return `${a.day} ${month(a)}`;
  if (a.month === b.month) return `${a.day}–${b.day} ${month(b)}`;
  return `${a.day} ${month(a)} – ${b.day} ${month(b)}`;
}

/** "tis, ons, tors" in week order, from the days the sessions fall on. */
export function weekdaysOf(sessions) {
  const days = new Set(sessions.map((session) => parts(session.startAt, { weekday: "short" }).weekday.replace(".", "")));
  return DAY_ORDER.filter((day) => days.has(day)).join(", ");
}

/**
 * The sessions as a calendar: one column per weekday the course meets, one row per week. A cell
 * holds that day's sessions (usually one; none where a session was cancelled).
 */
export function weekGrid(sessions) {
  const placed = sessions.map((session) => {
    const p = parts(session.startAt, { weekday: "short", year: "numeric", month: "numeric", day: "numeric" });
    const weekday = p.weekday.replace(".", "");
    const monday = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day) - DAY_ORDER.indexOf(weekday));
    return { session, weekday, monday };
  });
  const days = DAY_ORDER.filter((day) => placed.some((item) => item.weekday === day));
  const weeks = new Map();
  for (const { session, weekday, monday } of placed) {
    if (!weeks.has(monday)) weeks.set(monday, { id: String(monday), cells: days.map(() => []) });
    weeks.get(monday).cells[days.indexOf(weekday)].push(session);
  }
  return { days, weeks: [...weeks.keys()].sort((a, b) => a - b).map((key) => weeks.get(key)) };
}

/** "18:00 - 19:00" when every session keeps the same hours, else "". */
export function commonHours(sessions) {
  const hours = new Set(sessions.map((session) => `${clock(session.startAt)}${valid(session.endAt) ? ` - ${clock(session.endAt)}` : ""}`));
  return hours.size === 1 ? [...hours][0] : "";
}

/**
 * The sessions as the calendar draws them (SessionSchedule). Hours stand on a session only when
 * they differ between sessions; otherwise the card states them once.
 */
export function scheduleSessions(sessions, now = Date.now()) {
  const hours = commonHours(sessions);
  return sessions.map((session) => ({
    id: session.startAt,
    startAt: session.startAt,
    date: shortDay(session.startAt),
    day: dayRange(session.startAt, session.startAt),
    time: hours ? "" : [clock(session.startAt), valid(session.endAt) ? clock(session.endAt) : ""].filter(Boolean).join(" - "),
    isPast: endOf(session) <= new Date(now).getTime(),
    cancelled: session.cancelled === true,
  }));
}

/** "7 nov 17:00 – 8 nov 16:00" for an event over several days; "" when it starts and ends the same day. */
export function multiDayTime(startAt, endAt) {
  if (!valid(startAt) || !valid(endAt)) return "";
  const day = (value) => parts(value, { year: "numeric", month: "numeric", day: "numeric" });
  const a = day(startAt);
  const b = day(endAt);
  if (a.year === b.year && a.month === b.month && a.day === b.day) return "";
  const date = (value) => {
    const p = parts(value, { day: "numeric", month: "short" });
    return `${p.day} ${p.month.replace(".", "")}`;
  };
  return `${date(startAt)} ${clock(startAt)} – ${date(endAt)} ${clock(endAt)}`;
}
