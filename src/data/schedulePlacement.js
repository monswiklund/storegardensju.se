// Upcoming/past placement shared by the home calendar, the course hubs, "next pass", the FAQ,
// the prerendered copy and the JSON-LD, so no two places disagree about whether a date has passed.

const timeOf = (value) => {
  if (typeof value !== "string" || value === "") return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

export const startTimeOf = (item) => timeOf(item?.startAt);

/** The end the item states (end time, else start plus duration); null when it states none. */
export function knownEndTimeOf(item) {
  const start = startTimeOf(item);
  const end = timeOf(item?.endAt);
  if (end !== null && (start === null || end >= start)) return end;
  if (start !== null && item?.durationMinutes > 0) return start + item.durationMinutes * 60_000;
  return null;
}

/**
 * - An invalid or missing start is never upcoming.
 * - "Tidigare" (bucketOverride past) always files the item as past.
 * - A known end decides on its own: once it has passed, "Kommande" cannot make the item future again.
 * - Without a known end the item is upcoming until it starts, or for as long as the editor keeps
 *   it on "Kommande" (an exhibition that runs on without an end date, say).
 */
export function isUpcoming(item, now = new Date()) {
  const start = startTimeOf(item);
  if (start === null || item?.bucketOverride === "past") return false;
  const cutoff = new Date(now).getTime();
  const end = knownEndTimeOf(item);
  if (end !== null) return end > cutoff;
  return start > cutoff || item?.bucketOverride === "upcoming";
}
