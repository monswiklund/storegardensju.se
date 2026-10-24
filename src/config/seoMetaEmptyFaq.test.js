import { describe, expect, it, vi } from "vitest";
import { activeJsonLd, seoMeta } from "./seoMeta";

// Editors emptied the wedding FAQ list: the export carries an empty list, not a missing one.
vi.mock("../data/cmsContent.generated.js", () => ({
  default: { exportedAt: "2026-07-20T00:00:00.000Z", revision: "r", pages: { wedding: { lists: { faq: [] } } }, events: [], coursePasses: [] },
}));

describe("emptied wedding FAQ", () => {
  it("renders no questions and declares no FAQPage", () => {
    const types = activeJsonLd(seoMeta.eventWedding, new Date("2026-07-01T00:00:00Z")).map((item) => item["@type"]);

    expect(seoMeta.eventWedding.staticContent.faq).toEqual([]);
    expect(types).not.toContain("FAQPage");
    expect(types).toContain("Service");
  });
});
