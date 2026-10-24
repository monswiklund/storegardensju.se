// Synthetic CMS content for tests: raw Payload documents as /api/<collection> returns them, and
// the snapshot the build export makes of them. Shaped after the 2026 course schedule; no real
// person's data beyond the instructors the site already names.
import { projectCoursePass, projectEvent, projectPage } from "../data/cmsProjection.js";

export const CMS_URL = "https://cms.example.test";

const yogaEvent = (id, legacyId, day, extra = {}) => ({
  id,
  legacyId,
  title: "Yoga på loftet",
  category: "yoga",
  startAt: `2026-08-${day}T16:00:00.000Z`,
  endAt: `2026-08-${day}T17:00:00.000Z`,
  description: "Yoga i lugnt tempo på loftet.",
  price: 150,
  dropIn: true,
  updatedAt: "2026-07-01T10:00:00.000Z",
  ...extra,
});

export const RAW_EVENTS = [
  {
    id: 1,
    legacyId: "course:yoga-pa-loftet-2026-07-30",
    title: "Yoga på loftet",
    category: "yoga",
    startAt: "2026-07-30T16:00:00.000Z",
    endAt: "2026-07-30T17:30:00.000Z",
    description: "Kvällsyoga på loftet.",
    price: 150,
    dropIn: true,
    updatedAt: "2026-07-01T10:00:00.000Z",
  },
  {
    id: 2,
    legacyId: "course:heldag-yoga-maleri-2026-07-13",
    title: "Heldag med yoga & måleri",
    category: "yoga",
    startAt: "2026-07-13T08:00:00.000Z",
    endAt: "2026-07-13T15:30:00.000Z",
    description: "Yoga med Lina och måleri med Ann.",
    price: 950,
    dropIn: false,
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  // Created in the CMS without a legacy id: its pass id is namespaced by collection.
  yogaEvent(7, null, "11"),
  yogaEvent(3, "course:yoga-2026-08-12", "12"),
  yogaEvent(4, "course:yoga-2026-08-13", "13"),
  yogaEvent(5, "course:yoga-2026-08-18", "18"),
  yogaEvent(6, "course:yoga-2026-08-19", "19"),
  yogaEvent(8, "course:yoga-2026-08-20", "20"),
  {
    id: 9,
    legacyId: null,
    title: "Loppis på gården",
    category: "ovrigt",
    startAt: "2026-08-01T08:00:00.000Z",
    endAt: "2026-08-01T13:00:00.000Z",
    description: "Loppis i ladan.",
    updatedAt: "2026-07-01T10:00:00.000Z",
  },
];

// Same numeric id (7) as an event on purpose: the two collections number independently.
export const RAW_COURSE_PASSES = [
  {
    id: 7,
    title: "Akvarell för nybörjare",
    track: "konst",
    instructor: "ann",
    startAt: "2026-09-05T08:00:00.000Z",
    endAt: "2026-09-05T12:00:00.000Z",
    price: 600,
    spots: 3,
    status: "few_left",
    description: "En förmiddag med akvarell.",
    bookingEmail: "ateljen@example.test",
    updatedAt: "2026-07-02T10:00:00.000Z",
  },
];

export const RAW_PAGES = [
  {
    id: 20,
    slug: "art",
    updatedAt: "2026-07-03T10:00:00.000Z",
    copy: [{ key: "hero.title", value: "Skapande" }],
    contentLists: [
      {
        key: "faq",
        items: [
          { title: "Finns det material?", body: "Ja, allt material finns i ateljén." },
          { title: "Halv fråga utan svar", body: "" },
        ],
      },
    ],
    imageSlots: [],
  },
];

export const SNAPSHOT = {
  exportedAt: "2026-07-20T00:00:00.000Z",
  revision: "2026-07-03T10:00:00.000Z",
  pages: Object.fromEntries(RAW_PAGES.map((doc) => [doc.slug, projectPage(doc, CMS_URL)])),
  events: RAW_EVENTS.map((doc) => projectEvent(doc, CMS_URL)),
  coursePasses: RAW_COURSE_PASSES.map(projectCoursePass),
};

/** A Payload list answer, paginated like the REST API. */
export function payloadPage(docs, { page = 1, pageSize = 100, totalDocs = docs.length } = {}) {
  const slice = docs.slice((page - 1) * pageSize, page * pageSize);
  return { docs: slice, totalDocs, page, hasNextPage: page * pageSize < totalDocs };
}

/** A fetch stand-in serving the given collections the way Payload does (limit/page/sort). */
export function fakePayloadFetch(collections, { onRequest } = {}) {
  return async (input) => {
    const url = new URL(input);
    const collection = url.pathname.replace(/^\/api\//, "");
    onRequest?.(collection, url);
    const docs = collections[collection];
    if (!docs) return { ok: false, status: 404, json: async () => ({}) };
    const limit = Number(url.searchParams.get("limit") || 10);
    const page = Number(url.searchParams.get("page") || 1);
    const sorted = url.searchParams.get("sort") === "-updatedAt"
      ? [...docs].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
      : [...docs].sort((a, b) => a.id - b.id);
    return { ok: true, status: 200, json: async () => payloadPage(sorted, { page, pageSize: limit }) };
  };
}
