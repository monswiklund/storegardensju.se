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
    const fetchImpl = fakePayloadFetch({ pages: allPages(), events: RAW_EVENTS, "course-passes": RAW_COURSE_PASSES, "shop-products": [] });

    const snapshot = await exportCmsContent(CMS_URL, { fetchImpl, now: NOW });

    expect(Object.keys(snapshot.pages).sort()).toEqual([...REQUIRED_PAGE_SLUGS].sort());
    expect(snapshot.events).toHaveLength(RAW_EVENTS.length);
    expect(snapshot.coursePasses).toHaveLength(RAW_COURSE_PASSES.length);
    expect(snapshot.revision).toBe("2026-07-02T10:00:00.000Z");
    expect(snapshot.exportedAt).toBe("2026-07-20T00:00:00.000Z");
  });

  it("exports each published product for its own page, and refuses one without a web address", async () => {
    const product = { id: 1, slug: "kopp-havsbla", title: "Kopp", price: 280, status: "in_stock", images: [], updatedAt: "2026-07-03T10:00:00.000Z" };
    const collections = { pages: allPages(), events: [], "course-passes": [], "shop-products": [product] };

    const snapshot = await exportCmsContent(CMS_URL, { fetchImpl: fakePayloadFetch(collections) });
    expect(snapshot.shopProducts).toEqual([expect.objectContaining({ slug: "kopp-havsbla", title: "Kopp", price: 280 })]);
    expect(snapshot.revision).toBe("2026-07-03T10:00:00.000Z");

    collections["shop-products"] = [{ ...product, slug: "" }];
    await expect(exportCmsContent(CMS_URL, { fetchImpl: fakePayloadFetch(collections) })).rejects.toThrow(/webbadress/);
  });

  it("refuses a build when a page the site renders is not published", async () => {
    const fetchImpl = fakePayloadFetch({ pages: allPages().filter((doc) => doc.slug !== "site"), events: [], "course-passes": [], "shop-products": [] });

    await expect(exportCmsContent(CMS_URL, { fetchImpl })).rejects.toThrow(/site/);
  });

  it("refuses two published pages with one slug", async () => {
    const fetchImpl = fakePayloadFetch({ pages: [...allPages(), { ...page("home"), id: "dup" }], events: [], "course-passes": [], "shop-products": [] });

    await expect(exportCmsContent(CMS_URL, { fetchImpl })).rejects.toThrow(/home/);
  });

  it("7: reads again when content changes during the export, and gives up after three changes", async () => {
    const collections = { pages: allPages(), events: [...RAW_EVENTS], "course-passes": [], "shop-products": [] };
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
    const collections = { pages: allPages(), events: [...RAW_EVENTS], "course-passes": [], "shop-products": [] };
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
      fetchImpl: fakePayloadFetch({ pages, events, "course-passes": [], "shop-products": [] }),
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
