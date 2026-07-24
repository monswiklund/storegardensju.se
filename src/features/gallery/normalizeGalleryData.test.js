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
    expect(result.featured).toEqual(["shared"]);
  });
});
