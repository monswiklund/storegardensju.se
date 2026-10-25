import { describe, expect, it } from "vitest";
import {
  eventMatchesCategory,
  bandImages,
  groupPastEvents,
  pastEventType,
  pastYearGroups,
} from "./pastEventsUtils.js";

describe("pastEventsUtils", () => {
  describe("eventMatchesCategory", () => {
    it("matches all categories when 'all' is selected", () => {
      expect(eventMatchesCategory({ title: "Yoga", category: "yoga" }, "all")).toBe(true);
      expect(eventMatchesCategory({ title: "Keramik", category: "keramik" }, "all")).toBe(true);
    });

    it("matches yoga category correctly", () => {
      expect(eventMatchesCategory({ title: "Yogapass på loftet", category: "yoga" }, "yoga")).toBe(true);
      // The category decides: words in the title do not move an event between filters.
      expect(eventMatchesCategory({ title: "Heldag med yoga & måleri", category: "ovrigt" }, "yoga")).toBe(false);
      expect(eventMatchesCategory({ title: "Kvällsklass", description: "Lugn yoga", category: "konst" }, "yoga")).toBe(false);
      expect(eventMatchesCategory({ title: "Konstafton", category: "marknad" }, "yoga")).toBe(false);
    });

    it("matches courses category correctly", () => {
      expect(eventMatchesCategory({ title: "Helgkurs Keramik", category: "keramik" }, "courses")).toBe(true);
      expect(eventMatchesCategory({ title: "Målarkurs", category: "konst" }, "courses")).toBe(true);
      expect(eventMatchesCategory({ title: "Heldag med yoga & måleri", category: "ovrigt" }, "courses")).toBe(false);
      expect(eventMatchesCategory({ title: "Heldag med yoga & måleri", category: "ovrigt" }, "events")).toBe(true);
      expect(eventMatchesCategory({ title: "Konstafton", category: "marknad" }, "courses")).toBe(false);
    });

    it("matches general events and markets correctly", () => {
      expect(eventMatchesCategory({ title: "Konstafton 2025", category: "marknad" }, "events")).toBe(true);
      expect(eventMatchesCategory({ title: "Västra Kållands Kulturrunda", category: "oppet_hus" }, "events")).toBe(true);
      expect(eventMatchesCategory({ title: "Helgkurs Keramik", category: "keramik" }, "events")).toBe(false);
    });
  });

  describe("groupPastEvents", () => {
    it("groups multiple recurring yoga passes in the same month into a single summary entry", () => {
      const pastEvents = [
        {
          id: "yoga-1",
          title: "Drop-in pass (60 min)",
          date: "13 Aug 2026",
          startAt: "2026-08-13T18:00:00+02:00",
          category: "yoga",
          image: { src: "/images/yoga-1.jpg" },
        },
        {
          id: "yoga-2",
          title: "Drop-in pass (60 min)",
          date: "12 Aug 2026",
          startAt: "2026-08-12T18:00:00+02:00",
          category: "yoga",
          image: { src: "/images/yoga-2.jpg" },
        },
        {
          id: "yoga-3",
          title: "Lugnt kvällspass (90 min)",
          date: "11 Aug 2026",
          startAt: "2026-08-11T18:00:00+02:00",
          category: "yoga",
        },
        {
          id: "konstafton",
          title: "Konstafton 2025",
          date: "1 Nov 2025",
          startAt: "2025-11-01T12:00:00+01:00",
          category: "marknad",
        },
      ];

      const grouped = groupPastEvents(pastEvents);

      // Should have 2 entries: the grouped yoga card and Konstafton
      expect(grouped).toHaveLength(2);

      const yogaCard = grouped.find((e) => e.isGroupedSeries);
      expect(yogaCard).toBeDefined();
      expect(yogaCard.title).toBe("Yogapass på loftet");
      expect(yogaCard.badge).toBe("3 tillfällen");
      expect(yogaCard.date).toBe("11–13 Aug 2026");
      expect(yogaCard.sessions).toHaveLength(3);
    });

    it("does not group distinct standout combination events like 'Heldag med yoga & måleri'", () => {
      const pastEvents = [
        {
          id: "yoga-heldag",
          title: "Heldag med yoga & måleri",
          date: "13 Jul 2026",
          startAt: "2026-07-13T10:00:00+02:00",
          category: "yoga",
          moments: [{ time: "10:00", title: "Morgonyoga" }],
        },
        {
          id: "yoga-single",
          title: "Drop-in pass (60 min)",
          date: "30 Jul 2026",
          startAt: "2026-07-30T18:00:00+02:00",
          category: "yoga",
        },
      ];

      const grouped = groupPastEvents(pastEvents);
      // A CMS full day has no moments; its length keeps it out of the series.
      const cmsDay = { id: "cms-heldag", title: "Heldag", startAt: "2026-07-13T08:00:00Z", endAt: "2026-07-13T15:30:00Z", category: "yoga" };
      expect(groupPastEvents([cmsDay, pastEvents[1], { ...pastEvents[1], id: "yoga-2", startAt: "2026-07-31T18:00:00+02:00" }])
        .find((e) => e.id === "cms-heldag")).toBeDefined();

      // Both should remain individual entries since single pass is only 1 in its month/group and heldag is special
      expect(grouped).toHaveLength(2);
      expect(grouped.find((e) => e.id === "yoga-heldag")).toBeDefined();
      expect(grouped.find((e) => e.id === "yoga-single")).toBeDefined();
    });
  });

  it("keeps a course entered with its sessions as its own card, apart from the month grouping", () => {
    const loose = ["2026-08-11", "2026-08-12"].map((day, i) => ({ id: `y${i}`, title: "Yoga", category: "yoga", date: `${Number(day.slice(8))} Augusti 2026`, startAt: `${day}T16:00:00.000Z` }));
    const course = { id: "events:9", title: "Yoga på loftet", category: "yoga", isGroupedSeries: true, startAt: "2026-08-04T16:00:00.000Z", sortAt: "2026-08-27T16:00:00.000Z" };

    const grouped = groupPastEvents([...loose, course]);
    expect(grouped.map((event) => event.id)).toEqual(["events:9", "yoga-series-2026-08"]);
  });
});

describe("year list", () => {
  const at = (id, startAt, images = []) => ({ id, title: id, startAt, images });

  it("puts events under their year on the farm's clock", () => {
    // 23:30Z on 31 Dec 2025 is already New Year's Day in Stockholm.
    const events = [at("a", "2026-07-13T08:00:00Z"), at("b", "2025-12-31T23:30:00Z"), at("c", "2025-11-01T10:00:00Z")];
    expect(pastYearGroups(events).map((group) => [group.year, group.events.map((event) => event.id)])).toEqual([
      ["2026", ["a", "b"]],
      ["2025", ["c"]],
    ]);
  });

  it("picks different photos for the band, skipping events without one", () => {
    const loft = { src: "loft.jpg" };
    const events = [
      at("a", "2026-09-01T08:00:00Z", [loft]),
      at("b", "2026-08-01T08:00:00Z", [loft, { src: "mat.jpg" }]),
      at("c", "2026-07-01T08:00:00Z"),
      at("d", "2025-11-01T08:00:00Z", [{ src: "konst.jpg" }]),
    ];
    expect(bandImages(events).map(({ image, event }) => `${event.id}:${image.src}`)).toEqual(["a:loft.jpg", "b:mat.jpg", "d:konst.jpg"]);
  });

  it("names the kind of event in a word", () => {
    expect([{ category: "yoga" }, { category: "keramik" }, { category: "kultur" }].map(pastEventType)).toEqual(["Yoga", "Kurs", "Evenemang"]);
  });
});
