import { describe, expect, it } from "vitest";
import { normalizeMediaList, resolveMediaUrl } from "./mediaService";

describe("mediaService", () => {
  it("prefers the requested generated size and resolves CMS paths", () => {
    expect(resolveMediaUrl({
      url: "/media/original.webp",
      sizes: { card: { url: "/media/card.webp" } },
    }, "card")).toBe("https://cms.storegardensju.se/media/card.webp");
  });

  it("preserves order and ignores cleared relationships", () => {
    expect(normalizeMediaList([
      { id: 2, externalUrl: "https://storegardensju.se/two.webp", alt: "Två" },
      null,
      { id: 1, externalUrl: "/images/one.webp", alt: "Ett" },
    ]).map((image) => image.id)).toEqual([2, 1]);
  });
});
