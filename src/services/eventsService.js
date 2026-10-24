import { getCmsUrl } from "./cmsService";
import { normalizeMediaList } from "./mediaService";
import { getPageCopySync } from "../hooks/usePageCopy";
import { fetchAllPublished, projectCoursePass, projectEvent } from "../data/cmsProjection.js";
import { isUpcoming } from "../data/schedulePlacement.js";
import CMS_CONTENT from "../data/cmsContent.generated.js";

let scheduleRequest = null;

/**
 * Every published event and course pass, read completely, or `{ source: "failed" }`. A failed or
 * truncated read is never returned as a (short) schedule, and nothing from the build snapshot is
 * mixed into a live answer.
 */
export function fetchCmsSchedule() {
  if (!scheduleRequest) {
    const cmsUrl = getCmsUrl();
    scheduleRequest = Promise.all([
      fetchAllPublished(cmsUrl, "events"),
      fetchAllPublished(cmsUrl, "course-passes"),
    ])
      .then(([events, coursePasses]) => ({
        source: "cms",
        events: events.map((doc) => projectEvent(doc, cmsUrl)),
        coursePasses: coursePasses.map(projectCoursePass),
      }))
      .catch((error) => {
        scheduleRequest = null;
        return { source: "failed", reason: error.message };
      });
  }
  return scheduleRequest;
}

export function clearScheduleCache() {
  scheduleRequest = null;
}

/**
 * The schedule to show. A complete live answer is authoritative, also when it is empty. Only
 * when it could not be read does the build snapshot stand in, labelled with when it was exported;
 * it is a stand-in, not news from the CMS.
 */
export function resolveSchedule(live, snapshot = CMS_CONTENT) {
  if (live?.source === "cms") return live;
  if (snapshot) {
    return { source: "snapshot", exportedAt: snapshot.exportedAt, events: snapshot.events, coursePasses: snapshot.coursePasses };
  }
  return { source: "none", events: [], coursePasses: [] };
}

const COURSE_PASS_CATEGORY = { yoga: "yoga", konst: "konst", keramik: "keramik", workshop: "ovrigt" };

/** A course pass in the shape the home calendar shows events in; keeps its booking status. */
function coursePassAsEvent(coursePass, siteCopy) {
  const status = {
    fully_booked: siteCopy("ui.spot-sold-out"),
    few_left: siteCopy("ui.spot-few-left"),
    cancelled: siteCopy("ui.cancelled", "Inställt"),
  }[coursePass.status];
  return {
    ...coursePass,
    id: `course-pass-${coursePass.id}`,
    category: COURSE_PASS_CATEGORY[coursePass.track] || "ovrigt",
    spots: status || (coursePass.spots ? `${coursePass.spots} ${siteCopy("ui.spots-label")}`.trim() : ""),
    images: [],
    links: [],
  };
}

export function partitionCmsEvents(docs, now = Date.now()) {
  const result = { upcoming: [], past: [] };

  for (const event of Array.isArray(docs) ? docs : []) {
    const normalized = {
      ...event,
      id: event.id,
      images: Array.isArray(event.media) && event.media.length > 0
        ? normalizeMediaList(event.media, "card")
        : (Array.isArray(event.images) ? event.images : []),
      links: Array.isArray(event.links) ? event.links : [],
    };
    result[isUpcoming(event, now) ? "upcoming" : "past"].push(normalized);
  }

  return result;
}

/** Events and course passes for the home calendar; `source` says where they came from. */
export async function fetchPublicEvents(now = Date.now()) {
  const schedule = resolveSchedule(await fetchCmsSchedule());
  const siteCopy = getPageCopySync("site");
  const docs = [
    // Shared links (?pastEvent=…) use the legacy id where an event has one.
    ...schedule.events.map((event) => ({ ...event, id: event.legacyId || `events:${event.id}` })),
    ...schedule.coursePasses.map((coursePass) => coursePassAsEvent(coursePass, siteCopy)),
  ];
  return { source: schedule.source, ...partitionCmsEvents(docs, now) };
}
