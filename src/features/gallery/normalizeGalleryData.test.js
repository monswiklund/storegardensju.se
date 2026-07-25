import { normalizeGalleryData } from "./normalizeGalleryData";

describe("normalizeGalleryData", () => {
  it("V9 rebuilds Alla bilder from specific categories and removes duplicates", () => {
    const result = normalizeGalleryData({
      featured: ["shared"],
      categories: [
        {
          id: "alla",
          name: "Alla bilder",
          images: [{ id: "legacy-only", url: "/legacy.webp" }],
        },
        {
          id: "ladan",
          name: "Ladan",
          order: 2,
          images: [
            { id: "shared", url: "/shared.webp" },
            { id: "barn", url: "/barn.webp" },
            { id: "barn", url: "/stale-barn.webp" },
          ],
        },
        {
          id: "loftet",
          name: "Loftet",
          order: 1,
          images: [
            { id: "shared", url: "/shared.webp" },
            { id: "wedding", url: "/wedding.webp" },
          ],
        },
      ],
    });

    expect(result.categories.map((category) => category.id)).toEqual([
      "alla",
      "loftet",
      "ladan",
    ]);
    expect(result.categories[0].images.map((image) => image.id)).toEqual([
      "shared",
      "wedding",
      "barn",
    ]);
    expect(result.categories[0].images).toHaveLength(3);
    expect(result.categories[2].images.map((image) => image.id)).toEqual([
      "shared",
      "barn",
    ]);
    expect(result.featured).toEqual(["shared"]);
  });

  it("V26 honours the curated order stored on Alla bilder", () => {
    const result = normalizeGalleryData({
      categories: [
        {
          id: "alla",
          name: "Alla bilder",
          images: [
            { id: "barn", url: "/barn.webp", order: 10 },
            { id: "wedding", url: "/wedding.webp", order: 20 },
            { id: "shared", url: "/shared.webp", order: 30 },
          ],
        },
        {
          id: "ladan",
          name: "Ladan",
          order: 1,
          images: [
            { id: "shared", url: "/shared.webp", order: 10 },
            { id: "barn", url: "/barn.webp", order: 20 },
          ],
        },
        {
          id: "loftet",
          name: "Loftet",
          order: 2,
          images: [{ id: "wedding", url: "/wedding.webp", order: 10 }],
        },
      ],
    });

    expect(result.categories[0].images.map((image) => image.id)).toEqual([
      "barn",
      "wedding",
      "shared",
    ]);
    // The specific categories keep their own order, untouched by the curated one.
    expect(result.categories[1].images.map((image) => image.id)).toEqual([
      "shared",
      "barn",
    ]);
  });

  it("V26 puts images that are not members of Alla bilder last", () => {
    const result = normalizeGalleryData({
      categories: [
        {
          id: "alla",
          name: "Alla bilder",
          images: [{ id: "barn", url: "/barn.webp", order: 10 }],
        },
        {
          id: "ladan",
          name: "Ladan",
          order: 1,
          images: [
            { id: "fresh", url: "/fresh.webp", order: 5 },
            { id: "barn", url: "/barn.webp", order: 10 },
          ],
        },
      ],
    });

    expect(result.categories[0].images.map((image) => image.id)).toEqual([
      "barn",
      "fresh",
    ]);
  });

  it("V26 sorts category images on order, not on API sequence", () => {
    const result = normalizeGalleryData({
      categories: [
        {
          id: "ladan",
          name: "Ladan",
          order: 1,
          images: [
            { id: "third", url: "/c.webp", order: 30 },
            { id: "first", url: "/a.webp", order: 10 },
            { id: "second", url: "/b.webp", order: 20 },
          ],
        },
      ],
    });

    const ladan = result.categories.find((category) => category.id === "ladan");
    expect(ladan.images.map((image) => image.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});
