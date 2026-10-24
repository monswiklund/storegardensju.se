import { afterEach, describe, expect, it, vi } from "vitest";

import { partitionCmsEvents } from "./eventsService";

describe("partitionCmsEvents", () => {
  it("separates upcoming from past events", () => {
    const result = partitionCmsEvents(
      [
        { id: 1, legacyId: "old-1", title: "Tidigare", endAt: "2025-01-01T12:00:00Z" },
        { id: 2, title: "Kommande", startAt: "2027-01-01T12:00:00Z" },
      ],
      Date.parse("2026-01-01T00:00:00Z"),
    );

    expect(result.past[0].id).toBe(1);
    expect(result.upcoming[0].title).toBe("Kommande");
  });

  it("prefers populated media relations over stale legacy image paths", () => {
    const result = partitionCmsEvents([
      {
        id: 1,
        startAt: "2027-01-01T12:00:00Z",
        mediaMigrated: false,
        images: [{ url: "/images/legacy.webp" }],
        media: [{ id: 9, url: "https://cdn.example/event.webp" }],
      },
    ], Date.parse("2026-01-01T00:00:00Z"));

    expect(result.upcoming[0].images[0].src).toBe("https://cdn.example/event.webp");
  });
});

describe("schedule authority (CMS live answer vs build snapshot)", () => {
  // Imported lazily so the stubbed fetch is in place for each case.
  const load = async () => {
    const service = await import("./eventsService");
    const { schedulePasses } = await import("../data/courseEvents.js");
    const fixture = await import("../test/cmsScheduleFixture.js");
    service.clearScheduleCache();
    return { ...service, schedulePasses, ...fixture };
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("1: shows no pass when the complete live answer has none, whatever the snapshot had", async () => {
    const { fetchCmsSchedule, resolveSchedule, schedulePasses, SNAPSHOT, fakePayloadFetch } = await load();
    vi.stubGlobal("fetch", fakePayloadFetch({ events: [], "course-passes": [] }));

    const schedule = resolveSchedule(await fetchCmsSchedule(), SNAPSHOT);

    expect(SNAPSHOT.events.length).toBeGreaterThan(0);
    expect(schedule.source).toBe("cms");
    expect(schedulePasses(schedule)).toEqual([]);
  });

  it("2: does not show an event unpublished after the export", async () => {
    const { fetchCmsSchedule, resolveSchedule, schedulePasses, SNAPSHOT, RAW_EVENTS, RAW_COURSE_PASSES, fakePayloadFetch } = await load();
    const live = RAW_EVENTS.filter((doc) => doc.id !== 1);
    vi.stubGlobal("fetch", fakePayloadFetch({ events: live, "course-passes": RAW_COURSE_PASSES }));

    const ids = schedulePasses(resolveSchedule(await fetchCmsSchedule(), SNAPSHOT)).map((pass) => pass.id);

    expect(ids).not.toContain("course:yoga-pa-loftet-2026-07-30");
    expect(ids).toContain("course:yoga-2026-08-12");
  });

  it("3: does not fill in a field the editor emptied after the export", async () => {
    const { fetchCmsSchedule, resolveSchedule, schedulePasses, SNAPSHOT, RAW_EVENTS, fakePayloadFetch } = await load();
    const live = RAW_EVENTS.map((doc) => (doc.id === 1 ? { ...doc, description: "", price: null } : doc));
    vi.stubGlobal("fetch", fakePayloadFetch({ events: live, "course-passes": [] }));

    const pass = schedulePasses(resolveSchedule(await fetchCmsSchedule(), SNAPSHOT))
      .find((item) => item.id === "course:yoga-pa-loftet-2026-07-30");

    expect(pass.summary).toBe("");
    expect(pass.price).toBeNull();
  });

  it("4: falls back to the labelled snapshot when the CMS cannot be reached", async () => {
    const { fetchCmsSchedule, resolveSchedule, schedulePasses, SNAPSHOT } = await load();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const live = await fetchCmsSchedule();
    const schedule = resolveSchedule(live, SNAPSHOT);

    expect(live.source).toBe("failed");
    expect(schedule.source).toBe("snapshot");
    expect(schedule.exportedAt).toBe(SNAPSHOT.exportedAt);
    expect(schedulePasses(schedule).length).toBeGreaterThan(0);
    // Nothing at all to show is reported as such, not as an empty calendar.
    expect(resolveSchedule(live, null).source).toBe("none");
  });

  it("5: treats a truncated answer as failed, not as a shorter schedule", async () => {
    const { fetchCmsSchedule, RAW_EVENTS, fakePayloadFetch } = await load();
    const serve = fakePayloadFetch({ events: RAW_EVENTS, "course-passes": [] });
    // totalDocs says 20, but only the fixture's documents exist.
    vi.stubGlobal("fetch", async (url) => {
      const response = await serve(url);
      const data = await response.json();
      return { ok: true, json: async () => (url.includes("/api/events") ? { ...data, totalDocs: 20 } : data) };
    });
    expect((await fetchCmsSchedule()).source).toBe("failed");

    const { clearScheduleCache } = await load();
    clearScheduleCache();
    // A second page that errors.
    const pages = fakePayloadFetch({ events: RAW_EVENTS, "course-passes": [] });
    vi.stubGlobal("fetch", async (url) => {
      if (url.includes("/api/events") && url.includes("page=2")) return { ok: false, status: 502, json: async () => ({}) };
      const response = await pages(url.replace("limit=100", "limit=4"));
      return response;
    });
    expect((await fetchCmsSchedule()).source).toBe("failed");
  });

  it("6: keeps events and course passes with the same number apart on the home calendar", async () => {
    const { fetchPublicEvents, RAW_EVENTS, RAW_COURSE_PASSES, fakePayloadFetch } = await load();
    vi.stubGlobal("fetch", fakePayloadFetch({ events: RAW_EVENTS, "course-passes": RAW_COURSE_PASSES }));

    const { upcoming, past, source } = await fetchPublicEvents(Date.parse("2026-07-01T00:00:00Z"));
    const ids = [...upcoming, ...past].map((item) => item.id);

    expect(source).toBe("cms");
    expect(ids).toContain("events:7");
    expect(ids).toContain("course-pass-7");
    expect(new Set(ids).size).toBe(ids.length);
  });
});
