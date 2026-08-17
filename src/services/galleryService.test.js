import {
  clearGalleryCategoriesCache,
  fetchGalleryCategories,
} from "./galleryService";

describe("galleryService", () => {
  beforeEach(() => {
    clearGalleryCategoriesCache();
    vi.restoreAllMocks();
  });

  it("keeps the original dimensions for the grid and a thumbnail for the lightbox", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            {
              id: 1,
              filename: "loftet.webp",
              displayName: "Loftet",
              alt: "Loftet dukat för fest",
              category: "overvaning",
              url: "/media/loftet.webp",
              width: 1600,
              height: 1000,
              sizes: {
                thumbnail: { url: "/media/loftet-400x300.webp" },
              },
            },
          ],
        }),
      })
    );

    const result = await fetchGalleryCategories();
    const image = result.categories[0].images[0];

    expect(image.path).toBe("https://cms.storegardensju.se/media/loftet.webp");
    expect(image.thumbnailPath).toBe(
      "https://cms.storegardensju.se/media/loftet-400x300.webp"
    );
    expect(image.width).toBe(1600);
    expect(image.height).toBe(1000);
  });

  it("preserves zero-based CMS order and legacy identities for featured images", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            { id: 2, legacyId: "second", category: "overvaning", order: 0, allOrder: 0, externalUrl: "/second.webp", featured: true },
            { id: 1, legacyId: "first", category: "overvaning", order: 0, allOrder: 0, externalUrl: "/first.webp", featured: true },
            { id: 3, legacyId: "third", category: "overvaning", order: 1, allOrder: 1, externalUrl: "/third.webp", featured: false },
          ],
        }),
      })
    );

    const result = await fetchGalleryCategories();
    const allImages = result.categories.find((category) => category.id === "alla").images;

    expect(allImages.map((image) => image.id)).toEqual(["first", "second", "third"]);
    expect(result.featured).toEqual(["first", "second"]);
  });
});
