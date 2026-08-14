import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearCmsPageCache,
  fetchPageCopy,
  fetchTeamMembers,
  logInquiry,
  normalizePageCopy,
} from "./cmsService";

describe("normalizePageCopy", () => {
  it("keeps valid editor values and ignores empty or malformed rows", () => {
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
    ).toEqual({ "hero.title": "Ny rubrik" });
  });
});

describe("fetchPageCopy", () => {
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

describe("logInquiry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never writes from localhost to the production CMS", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await logInquiry({ name: "Test" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3002/api/inquiries",
      expect.objectContaining({ method: "POST" }),
    );
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
