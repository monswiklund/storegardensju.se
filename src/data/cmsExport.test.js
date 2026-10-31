import { describe, expect, it } from "vitest";
import { exportCmsContent, renderModule } from "../../scripts/export-cms-content.js";
import { REQUIRED_PAGE_SLUGS, projectPage } from "./cmsProjection.js";
import { escapeAttr, escapeHtml, jsonForScript, socialImageUrl } from "../config/prerenderEscape.js";
import { CMS_URL, RAW_COURSE_PASSES, RAW_EVENTS, fakePayloadFetch } from "../test/cmsScheduleFixture.js";

const page = (slug, extra = {}) => ({ id: slug, slug, updatedAt: "2026-07-01T10:00:00.000Z", copy: [], contentLists: [], imageSlots: [], ...extra });
const allPages = () => REQUIRED_PAGE_SLUGS.map((slug) => page(slug));
const NOW = () => new Date("2026-07-20T00:00:00.000Z");

describe("exportCmsContent", () => {
  it("exports every published page, event and course pass with a content revision", async () => {
    const fetchImpl = fakePayloadFetch({ pages: allPages(), events: RAW_EVENTS, "course-passes": RAW_COURSE_PASSES, "shop-products": [], artworks: [], ceramics: [] });

    const snapshot = await exportCmsContent(CMS_URL, { fetchImpl, now: NOW });

    expect(Object.keys(snapshot.pages).sort()).toEqual([...REQUIRED_PAGE_SLUGS].sort());
    expect(snapshot.events).toHaveLength(RAW_EVENTS.length);
    expect(snapshot.coursePasses).toHaveLength(RAW_COURSE_PASSES.length);
    expect(snapshot.revision).toBe("2026-07-02T10:00:00.000Z");
    expect(snapshot.exportedAt).toBe("2026-07-20T00:00:00.000Z");
  });

  it("exports each published product for its own page, and refuses one without a web address", async () => {
    const product = { id: 1, slug: "kopp-havsbla", title: "Kopp", price: 280, status: "in_stock", images: [], updatedAt: "2026-07-03T10:00:00.000Z" };
    const collections = { pages: allPages(), events: [], "course-passes": [], "shop-products": [product], artworks: [], ceramics: [] };

    const snapshot = await exportCmsContent(CMS_URL, { fetchImpl: fakePayloadFetch(collections) });
    expect(snapshot.shopProducts).toEqual([expect.objectContaining({ slug: "kopp-havsbla", title: "Kopp", price: 280 })]);
    expect(snapshot.revision).toBe("2026-07-03T10:00:00.000Z");

    collections["shop-products"] = [{ ...product, slug: "" }];
    await expect(exportCmsContent(CMS_URL, { fetchImpl: fakePayloadFetch(collections) })).rejects.toThrow(/webbadress/);
  });

  it("exports artworks in the editors' drag order and leaves out one without an image", async () => {
    const image = (id) => ({ id, url: `/api/media/file/${id}.webp`, alt: `Bild ${id}`, width: 1800, height: 1200, sizes: { medium: { url: `/api/media/file/${id}-900.webp`, width: 900, height: 600 } } });
    const artwork = (id, _order, extra = {}) => ({ id, _order, title: `Verk ${id}`, image: image(id), placement: "wall", size: "large", updatedAt: "2026-07-01T10:00:00.000Z", ...extra });
    // Drag order keys compare as plain strings: "a0" < "aV" < "a~", which localeCompare does not keep.
    const artworks = [artwork(1, "a~"), artwork(2, "a0"), artwork(3, "aV", { size: "narrow", updatedAt: "2026-07-05T10:00:00.000Z" }), artwork(4, "a1", { image: null })];
    const collections = { pages: allPages(), events: [], "course-passes": [], "shop-products": [], artworks, ceramics: [] };

    const snapshot = await exportCmsContent(CMS_URL, { fetchImpl: fakePayloadFetch(collections) });

    expect(snapshot.artworks.map((work) => work.id)).toEqual([2, 3, 1]);
    expect(snapshot.artworks[1]).toMatchObject({ size: "narrow", placement: "wall", image: { url: `${CMS_URL}/api/media/file/3.webp`, sizes: { medium: { url: `${CMS_URL}/api/media/file/3-900.webp` } } } });
    expect(snapshot.revision).toBe("2026-07-05T10:00:00.000Z");
  });

  it("exports ceramics with the piece itself as the image, its focal point and a known type only", async () => {
    const piece = (id, _order, extra = {}) => ({
      id, _order, url: `/api/ceramics/file/${id}.webp`, filename: `${id}.webp`, width: 1200, height: 1600, focalX: 50, focalY: 35,
      sizes: { medium: { url: `/api/ceramics/file/${id}-900.webp`, width: 900, height: 1200 } }, type: "skal", glaze: "Stengods", updatedAt: "2026-07-01T10:00:00.000Z", ...extra,
    });
    const ceramics = [piece(1, "a1"), piece(2, "a0", { type: "tekanna", title: "Kanna" }), piece(3, "a2", { url: null, filename: null, sizes: {} })];
    const collections = { pages: allPages(), events: [], "course-passes": [], "shop-products": [], artworks: [], ceramics };

    const snapshot = await exportCmsContent(CMS_URL, { fetchImpl: fakePayloadFetch(collections) });

    expect(snapshot.ceramics.map((work) => work.id)).toEqual([2, 1]);
    expect(snapshot.ceramics[0]).toMatchObject({ title: "Kanna", type: null });
    expect(snapshot.ceramics[1]).toMatchObject({ type: "skal", glaze: "Stengods", image: { url: `${CMS_URL}/api/ceramics/file/1.webp`, focalX: 50, focalY: 35, sizes: { medium: { width: 900 } } } });
  });

  it("refuses a build when a page the site renders is not published", async () => {
    const fetchImpl = fakePayloadFetch({ pages: allPages().filter((doc) => doc.slug !== "site"), events: [], "course-passes": [], "shop-products": [], artworks: [], ceramics: [] });

    await expect(exportCmsContent(CMS_URL, { fetchImpl })).rejects.toThrow(/site/);
  });

  it("refuses two published pages with one slug", async () => {
    const fetchImpl = fakePayloadFetch({ pages: [...allPages(), { ...page("home"), id: "dup" }], events: [], "course-passes": [], "shop-products": [], artworks: [], ceramics: [] });

    await expect(exportCmsContent(CMS_URL, { fetchImpl })).rejects.toThrow(/home/);
  });

  it("7: reads again when content changes during the export, and gives up after three changes", async () => {
    const collections = { pages: allPages(), events: [...RAW_EVENTS], "course-passes": [], "shop-products": [], artworks: [], ceramics: [] };
    const serve = fakePayloadFetch(collections);
    let consistencyChecks = 0;
    // An editor publishes a new event right after every full read.
    const fetchImpl = async (url) => {
      if (url.includes("sort=-updatedAt") && url.includes("/api/events")) {
        consistencyChecks += 1;
        collections.events.push({ id: 100 + consistencyChecks, title: "Ny", startAt: "2026-09-01T10:00:00Z", updatedAt: `2026-07-1${consistencyChecks}T10:00:00.000Z` });
      }
      return serve(url);
    };

    await expect(exportCmsContent(CMS_URL, { fetchImpl })).rejects.toThrow(/ändrades/);
    expect(consistencyChecks).toBe(3);
  });

  it("succeeds on a retry when the change stops", async () => {
    const collections = { pages: allPages(), events: [...RAW_EVENTS], "course-passes": [], "shop-products": [], artworks: [], ceramics: [] };
    const serve = fakePayloadFetch(collections);
    let changed = false;
    const fetchImpl = async (url) => {
      if (!changed && url.includes("sort=-updatedAt") && url.includes("/api/events")) {
        changed = true;
        collections.events = collections.events.filter((doc) => doc.id !== 1);
      }
      return serve(url);
    };

    const snapshot = await exportCmsContent(CMS_URL, { fetchImpl });

    expect(snapshot.events.map((doc) => doc.id)).not.toContain(1);
  });

  it("keeps only allowed fields and keeps empty values empty", async () => {
    const pages = allPages().map((doc) =>
      doc.slug === "home"
        ? {
            ...doc,
            copy: [{ key: "hero.title", value: "" }],
            contentLists: [{ key: "bullets", items: [] }],
            imageSlots: [{ key: "hero.background", image: null }],
            socialImage: null,
            _status: "published",
            createdBy: { email: "redaktor@example.test" },
          }
        : doc,
    );
    const events = [{ ...RAW_EVENTS[0], description: "", internalNote: "hemlig", createdBy: { email: "x@example.test" } }];
    const snapshot = await exportCmsContent(CMS_URL, {
      fetchImpl: fakePayloadFetch({ pages, events, "course-passes": [], "shop-products": [], artworks: [], ceramics: [] }),
    });
    const home = snapshot.pages.home;

    expect(home.copy).toEqual({ "hero.title": "" });
    expect(home.lists).toEqual({ bullets: [] });
    expect(home.images).toEqual({ "hero.background": null });
    expect(home.socialImage).toBeNull();
    expect(JSON.stringify(snapshot)).not.toMatch(/example\.test|hemlig|_status|createdBy/);
    expect(snapshot.events[0].description).toBe("");
  });
});

describe("generated module and prerender escaping", () => {
  const hostile = 'Citat "här" & </script><script>alert(1)</script>';

  it("writes a module that cannot be broken out of by CMS text", async () => {
    const snapshot = { exportedAt: "x", revision: null, pages: { home: projectPage(page("home", { copy: [{ key: "t", value: hostile }] })) }, events: [], coursePasses: [] };
    const source = renderModule(snapshot);
    const module = await import(`data:text/javascript,${encodeURIComponent(source)}`);

    expect(module.default.pages.home.copy.t).toBe(hostile);
  });

  it("escapes attribute, element and script contexts", () => {
    expect(escapeAttr(hostile)).not.toContain('"');
    expect(escapeHtml(hostile)).not.toMatch(/<\/?script/);
    expect(jsonForScript({ text: hostile })).not.toContain("</script");
    expect(JSON.parse(jsonForScript({ text: hostile })).text).toBe(hostile);
    expect(escapeAttr("a & b")).toBe("a &amp; b");
  });

  it("takes the share image from the exported page, hero size first", () => {
    expect(socialImageUrl({ socialImage: { url: "https://cdn/a.webp", sizes: { hero: { url: "https://cdn/a-hero.webp" } } } }))
      .toBe("https://cdn/a-hero.webp");
    expect(socialImageUrl({ socialImage: null })).toBeNull();
    expect(socialImageUrl(undefined)).toBeNull();
  });
});
