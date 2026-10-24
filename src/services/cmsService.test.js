import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearCmsPageCache,
  fetchPageContent,
  fetchPageCopy,
  getPageContentSync,
  fetchTeamMembers,
  getPageCopySync,
  normalizePageAppearance,
  normalizePageContent,
  normalizePageCopy,
} from "./cmsService";

describe("normalizePageCopy", () => {
  it("keeps valid and intentionally empty editor values and ignores malformed rows", () => {
    expect(
      normalizePageCopy({
        docs: [
          {
            copy: [
              { key: "hero.title", value: "Ny rubrik" },
              { key: "hero.empty", value: "  " },
              { value: "utan nyckel" },
            ],
          },
        ],
      }),
    ).toEqual({ "hero.title": "Ny rubrik", "hero.empty": "  " });
  });
});

describe("normalizePageContent", () => {
  it("keeps an intentionally empty CMS list instead of restoring fallback rows", () => {
    const content = normalizePageContent({
      docs: [{ contentLists: [{ key: "capacity-bullets", items: [] }] }],
    });

    expect(content.found).toBe(true);
    expect(content.lists).toEqual({ "capacity-bullets": [] });
  });
});

describe("normalizePageAppearance", () => {
  it("accepts known presets and safely resets unknown values", () => {
    expect(normalizePageAppearance({
      pageTheme: "clay",
      heroLayout: "broken-layout",
      heroOverlay: "soft",
      sectionSpacing: "compact",
    })).toEqual({
      pageTheme: "clay",
      heroLayout: "original",
      heroOverlay: "soft",
      sectionSpacing: "compact",
    });
  });
});

describe("fetchPageCopy", () => {
  beforeEach(() => {
    clearCmsPageCache();
  });

  afterEach(() => {
    clearCmsPageCache();
    vi.unstubAllGlobals();
  });

  it("shares one request per page and fails closed to compiled copy", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([fetchPageCopy("home"), fetchPageCopy("home")]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(fetchPageCopy("home")).resolves.toEqual(
      expect.objectContaining({ "events.upcoming.title": "Kommande tillfällen" }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("replaces the shipped copy whole with a live page: a removed row is not filled back in", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [{ copy: [{ key: "instagram.title", value: "Ny rubrik" }] }],
        }),
      }),
    );

    const copy = await fetchPageCopy("home");

    expect(copy["instagram.title"]).toBe("Ny rubrik");
    expect(copy).not.toHaveProperty("events.upcoming.title");
    expect(getPageContentSync("home").source).toBe("cms");
  });

  it("keeps the shipped page when the CMS does not publish it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ docs: [] }) }));

    const content = await fetchPageContent("home");

    expect(content.source).toBe("fixture");
    expect(content.copy["events.upcoming.title"]).toBe("Kommande tillfällen");
  });

  it("treats an emptied CMS text as hidden and uses the code fallback only for a missing key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ docs: [{ copy: [{ key: "events.upcoming.title", value: "" }] }] }),
      }),
    );

    await fetchPageCopy("home");
    const copy = getPageCopySync("home");

    expect(copy("events.upcoming.title", "Kod-text")).toBe("");
    expect(copy("finns.inte", "Kod-text")).toBe("Kod-text");
  });
});

describe("fetchTeamMembers", () => {
  afterEach(() => {
    clearCmsPageCache();
    vi.unstubAllGlobals();
  });

  it("resolves uploaded profile images against the CMS origin", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [{ id: 1, name: "Ann", image: { url: "/api/media/file/ann.webp" } }],
        }),
      }),
    );

    await expect(fetchTeamMembers()).resolves.toEqual([
      expect.objectContaining({
        image: { url: "https://cms.storegardensju.se/api/media/file/ann.webp" },
      }),
    ]);
  });
});
