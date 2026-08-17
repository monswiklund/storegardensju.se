import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearCmsPageCache,
  fetchPageCopy,
  fetchTeamMembers,
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
    await expect(fetchPageCopy("home")).resolves.toEqual({});
    expect(fetchMock).toHaveBeenCalledTimes(2);
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
