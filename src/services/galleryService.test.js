import {
  clearGalleryCategoriesCache,
  fetchGalleryCategories,
} from "./galleryService";

describe("galleryService", () => {
  beforeEach(() => {
    clearGalleryCategoriesCache();
    vi.restoreAllMocks();
  });

  it("uses the CMS thumbnail for the grid and keeps the original for the lightbox", async () => {
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
  });
});
