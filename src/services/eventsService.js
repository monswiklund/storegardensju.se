import { getCmsUrl } from "./cmsService";
import { normalizeMediaList } from "./mediaService";
import { getPageCopySync } from "../hooks/usePageCopy";

export function partitionCmsEvents(docs, now = Date.now()) {
  const result = { upcoming: [], past: [] };

  for (const event of Array.isArray(docs) ? docs : []) {
    const normalized = {
      ...event,
      id: event.legacyId || event.id,
      images: Array.isArray(event.media) && event.media.length > 0
        ? normalizeMediaList(event.media, "card")
        : (Array.isArray(event.images) ? event.images : []),
      links: Array.isArray(event.links) ? event.links : [],
    };
    const end = new Date(event.endAt || event.startAt || 0).getTime();
    const bucket =
      event.bucketOverride === "past" || event.bucketOverride === "upcoming"
        ? event.bucketOverride
        : Number.isFinite(end) && end < now
          ? "past"
          : "upcoming";

    result[bucket].push(normalized);
  }

  return result;
}

export async function fetchPublicCoursePasses() {
  try {
    const query = new URLSearchParams({ limit: "100", depth: "1", sort: "startAt" });
    const response = await fetch(`${getCmsUrl()}/api/course-passes?${query}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const siteCopy = getPageCopySync("site");
    return (data?.docs || []).map((pass) => ({
      ...pass,
      id: `course-pass-${pass.id}`,
      category: pass.track || "yoga",
      spots:
        pass.status === "fully_booked"
          ? (siteCopy ? siteCopy("ui.spot-full") : "")
          : pass.status === "few_left"
            ? (siteCopy ? siteCopy("ui.spot-few-left") : "")
            : pass.spots
              ? `${pass.spots} ${siteCopy ? siteCopy("ui.spots-label") : ""}`
              : "",
    }));
  } catch {
    return [];
  }
}

export async function fetchPublicEvents() {
  const query = new URLSearchParams({ limit: "100", depth: "1", sort: "sortOrder" });
  const [eventsRes, coursePasses] = await Promise.all([
    fetch(`${getCmsUrl()}/api/events?${query}`, {
      headers: { Accept: "application/json" },
    }).catch(() => null),
    fetchPublicCoursePasses(),
  ]);

  let eventDocs = [];
  if (eventsRes && eventsRes.ok) {
    const data = await eventsRes.json();
    eventDocs = Array.isArray(data?.docs) ? data.docs : [];
  }

  const allDocs = [...eventDocs, ...coursePasses];
  return partitionCmsEvents(allDocs);
}
