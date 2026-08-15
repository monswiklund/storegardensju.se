import { describe, expect, it } from "vitest";
import {
  eventMatchesCategory,
  groupPastEvents,
} from "./pastEventsUtils.js";

describe("pastEventsUtils", () => {
  describe("eventMatchesCategory", () => {
    it("matches all categories when 'all' is selected", () => {
      expect(eventMatchesCategory({ title: "Yoga", category: "yoga" }, "all")).toBe(true);
      expect(eventMatchesCategory({ title: "Keramik", category: "keramik" }, "all")).toBe(true);
    });

    it("matches yoga category correctly", () => {
      expect(eventMatchesCategory({ title: "Yogapass på loftet", category: "yoga" }, "yoga")).toBe(true);
      expect(eventMatchesCategory({ title: "Heldag med yoga & måleri", category: "ovrigt" }, "yoga")).toBe(true);
      expect(eventMatchesCategory({ title: "Konstafton", category: "marknad" }, "yoga")).toBe(false);
    });

    it("matches courses category correctly", () => {
      expect(eventMatchesCategory({ title: "Helgkurs Keramik", category: "keramik" }, "courses")).toBe(true);
      expect(eventMatchesCategory({ title: "Målarkurs", category: "konst" }, "courses")).toBe(true);
      expect(eventMatchesCategory({ title: "Heldag med yoga & måleri", category: "ovrigt" }, "courses")).toBe(true);
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

      // Both should remain individual entries since single pass is only 1 in its month/group and heldag is special
      expect(grouped).toHaveLength(2);
      expect(grouped.find((e) => e.id === "yoga-heldag")).toBeDefined();
      expect(grouped.find((e) => e.id === "yoga-single")).toBeDefined();
    });
  });
});
