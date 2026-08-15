import { describe, expect, it } from "vitest";

import { partitionCmsEvents } from "./eventsService";

describe("partitionCmsEvents", () => {
  it("preserves legacy IDs and separates upcoming from past events", () => {
    const result = partitionCmsEvents(
      [
        { id: 1, legacyId: "old-1", title: "Tidigare", endAt: "2025-01-01T12:00:00Z" },
        { id: 2, title: "Kommande", startAt: "2027-01-01T12:00:00Z" },
      ],
      Date.parse("2026-01-01T00:00:00Z"),
    );

    expect(result.past[0].id).toBe("old-1");
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
