import { getCmsUrl } from "./cmsService";
import { normalizeMediaList } from "./mediaService";

export function partitionCmsEvents(docs, now = Date.now()) {
  const result = { upcoming: [], past: [] };

  for (const event of Array.isArray(docs) ? docs : []) {
    const normalized = {
      ...event,
      id: event.legacyId || event.id,
      images: event.mediaMigrated
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

export async function fetchPublicEvents() {
  const query = new URLSearchParams({ limit: "100", depth: "1", sort: "sortOrder" });
  const response = await fetch(`${getCmsUrl()}/api/events?${query}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Events request failed with status ${response.status}`);

  const data = await response.json();
  return partitionCmsEvents(data?.docs);
}
