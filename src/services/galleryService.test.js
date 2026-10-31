import {
  clearGalleryCategoriesCache,
  fetchGalleryCategories,
} from "./galleryService";

describe("galleryService", () => {
  beforeEach(() => {
    clearGalleryCategoriesCache();
    vi.restoreAllMocks();
  });

  it("uses the editable all-category label for the internal alla id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [{ id: 1, category: "overvaning", externalUrl: "https://example.com/loft.webp" }],
        }),
      }),
    );

    const data = await fetchGalleryCategories();

    expect(data.categories.find((category) => category.id === "alla")?.name).toBe("Alla bilder");
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

  it("collects the photos marked for the gallery's selection as Utvalda, in Alla bilder order", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            { id: 1, category: "overvaning", allOrder: 2, externalUrl: "/a.webp", galleryFeatured: true },
            { id: 2, category: "undervaning", allOrder: 0, externalUrl: "/b.webp", galleryFeatured: true },
            { id: 3, category: "undervaning", allOrder: 1, externalUrl: "/c.webp", galleryFeatured: false },
          ],
        }),
      })
    );

    const result = await fetchGalleryCategories();
    const picks = result.categories.find((category) => category.id === "utvalda");

    expect(picks.name).toBe("Utvalda");
    expect(picks.order).toBeLessThan(result.categories.find((category) => category.id === "alla").order);
    expect(picks.images.map((image) => image.id)).toEqual(["2", "1"]);
  });

  it("leaves out Utvalda when no photo is marked for it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ docs: [{ id: 1, category: "overvaning", externalUrl: "/a.webp" }] }),
      })
    );

    const result = await fetchGalleryCategories();

    expect(result.categories.some((category) => category.id === "utvalda")).toBe(false);
  });

  describe("pagination", () => {
    const docsFor = (from, to) =>
      Array.from({ length: to - from }, (_, i) => ({
        id: from + i + 1,
        category: "overvaning",
        order: from + i,
        allOrder: from + i,
        externalUrl: `/bild-${from + i + 1}.webp`,
      }));
    const pagedFetch = (total, { lieAboutEnd = false, failPage = null } = {}) =>
      vi.fn(async (url) => {
        const params = new URL(url).searchParams;
        const page = Number(params.get("page"));
        const limit = Number(params.get("limit"));
        if (page === failPage) return { ok: false, status: 503, json: async () => ({}) };
        const docs = docsFor((page - 1) * limit, Math.min(page * limit, total));
        const hasNextPage = lieAboutEnd ? false : page * limit < total;
        return { ok: true, json: async () => ({ docs, totalDocs: total, hasNextPage, page, limit }) };
      });

    it("collects every page of a library larger than one response", async () => {
      const fetchMock = pagedFetch(250);
      vi.stubGlobal("fetch", fetchMock);

      const result = await fetchGalleryCategories();
      const all = result.categories.find((category) => category.id === "alla").images;

      expect(fetchMock).toHaveBeenCalledTimes(3);
      const params = new URL(fetchMock.mock.calls[0][0]).searchParams;
      expect(params.get("depth")).toBe("0");
      expect(params.get("where[showInGallery][equals]")).toBe("true");
      expect(all).toHaveLength(250);
      expect(all.at(-1).id).toBe("250");
    });

    it("refuses a gallery that ends before totalDocs instead of showing it cut off", async () => {
      vi.stubGlobal("fetch", pagedFetch(250, { lieAboutEnd: true }));
      expect(await fetchGalleryCategories()).toBeNull();
    });

    it("refuses a gallery when a later page fails", async () => {
      vi.stubGlobal("fetch", pagedFetch(250, { failPage: 2 }));
      expect(await fetchGalleryCategories()).toBeNull();
    });
  });
});
