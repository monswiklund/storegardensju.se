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
});
