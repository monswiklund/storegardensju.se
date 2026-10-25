import { describe, expect, it } from "vitest";
import { toUiEvent } from "./toUiEvent.js";

describe("toUiEvent", () => {
  it("maps event dates, times, and image URLs for the public event card", () => {
    const event = toUiEvent({
      title: "Yoga",
      startAt: "2026-07-30T18:00:00+02:00",
      endAt: "2026-07-30T19:30:00+02:00",
      images: [{ url: "/images/yoga.webp", alt: "Yoga" }],
    });

    expect(event).toMatchObject({
      title: "Yoga",
      date: "30 Juli 2026",
      time: "18:00 - 19:30",
      image: {
        src: "/images/yoga.webp",
        alt: "Yoga",
      },
    });
  });

  it("shows an event over several days with both dates instead of a backwards clock", () => {
    const event = toUiEvent({ title: "Helgkurs", startAt: "2024-11-22T16:00:00.000Z", endAt: "2024-11-23T15:00:00.000Z" });
    expect(event.time).toBe("22 nov 17:00 – 23 nov 16:00");
  });

  it("makes one card of a course: its days and hours, the next session and the ones left", () => {
    const sessions = ["2026-08-11", "2026-08-12", "2026-08-13", "2026-08-18"].map((day) => ({
      startAt: `${day}T16:00:00.000Z`,
      endAt: `${day}T17:00:00.000Z`,
    }));
    const event = toUiEvent({ title: "Yoga", startAt: sessions[0].startAt, endAt: sessions[3].endAt, sessions }, new Date("2026-08-12T18:00:00Z"));

    expect(event).toMatchObject({
      date: "13 Augusti 2026",
      sortAt: "2026-08-13T16:00:00.000Z",
      time: "tis, ons, tors · 18:00 - 19:00",
      isGroupedSeries: true,
    });
    expect(event.range).toMatch(/^13–18 aug · 2\b/);
    expect(event.badge).toMatch(/^4\b/);
    expect(event.sessions.map((session) => [session.date, session.day, session.isPast])).toEqual([
      ["tis 11 aug", "11 aug", true],
      ["ons 12 aug", "12 aug", true],
      ["tors 13 aug", "13 aug", false],
      ["tis 18 aug", "18 aug", false],
    ]);
  });

  it("keeps a called-off day in the calendar but skips it as the next session and in the count", () => {
    const sessions = ["2026-08-11", "2026-08-13", "2026-08-18"].map((day, index) => ({
      startAt: `${day}T16:00:00.000Z`,
      endAt: `${day}T17:00:00.000Z`,
      cancelled: index === 1,
    }));
    const event = toUiEvent({ title: "Yoga", status: "few_left", startAt: sessions[0].startAt, endAt: sessions[2].endAt, sessions }, new Date("2026-08-12T00:00:00Z"));

    expect(event.status).toBe("few_left");
    expect(event.sortAt).toBe("2026-08-18T16:00:00.000Z");
    expect(event.badge).toMatch(/^2\b/);
    expect(event.sessions.map((session) => [session.day, session.cancelled])).toEqual([
      ["11 aug", false],
      ["13 aug", true],
      ["18 aug", false],
    ]);
  });

  it("dates a finished course within one month with its first and last day", () => {
    const sessions = ["2026-09-07", "2026-09-30"].map((day) => ({ startAt: `${day}T05:30:00.000Z`, endAt: `${day}T06:30:00.000Z` }));
    const event = toUiEvent({ title: "Morgonyoga", startAt: sessions[0].startAt, endAt: sessions[1].endAt, sessions }, new Date("2026-10-25T12:00:00Z"));
    expect(event.date).toBe("7–30 September 2026");
    expect(event.sessions).toHaveLength(2);
  });

  it("keeps an event with a single session an ordinary event", () => {
    const event = toUiEvent({ title: "Yoga", startAt: "2026-08-11T16:00:00.000Z", endAt: "2026-08-11T17:00:00.000Z", sessions: [{ startAt: "2026-08-11T16:00:00.000Z" }] });
    expect(event.isGroupedSeries).toBeUndefined();
    expect(event.time).toBe("18:00 - 19:00");
  });
});
