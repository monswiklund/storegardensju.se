import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearCmsPageCache,
  fetchPageCopy,
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
