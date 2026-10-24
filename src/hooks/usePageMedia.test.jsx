import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cdnAsset } from "../config/cdnAssets";

const cms = vi.hoisted(() => ({ fetchPageContent: vi.fn(), getPageContentSync: vi.fn() }));
const media = vi.hoisted(() => ({ fetchMediaById: vi.fn() }));

vi.mock("../services/livePreviewBridge.js", () => ({ extractPreviewData: (event) => event.data }));
vi.mock("../services/cmsService", () => cms);
vi.mock("../services/mediaService", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchMediaById: media.fetchMediaById,
}));

const { default: usePageMedia } = await import("./usePageMedia.js");

const doc = (id, name) => ({ id, url: `https://media.storegardensju.se/${name}.webp`, sizes: {} });
const url = (name) => `https://media.storegardensju.se/${name}.webp`;
const FALLBACK = "/images/fallback.webp";
const fallback = cdnAsset(FALLBACK);

const deferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const send = (imageSlots, extra = {}) =>
  act(() => window.dispatchEvent(new MessageEvent("message", { data: { slug: "home", imageSlots, ...extra } })));

const published = {
  source: "cms",
  found: true,
  images: { hero: doc(7, "gammal"), detail: doc(8, "detalj") },
};

beforeEach(() => {
  cms.getPageContentSync.mockReset().mockReturnValue(null);
  cms.fetchPageContent.mockReset().mockResolvedValue(published);
  media.fetchMediaById.mockReset().mockImplementation(async (id) => doc(id, `bild-${id}`));
});

async function renderPublished() {
  const hook = renderHook(() => usePageMedia("home"));
  await waitFor(() => expect(hook.result.current("hero", FALLBACK)).toBe(url("gammal")));
  return hook;
}

describe("usePageMedia content sources", () => {
  it("uses a CMS answer for a missing page as authoritative and shows the code images", async () => {
    cms.getPageContentSync.mockReturnValue({ source: "snapshot", found: true, images: { hero: doc(1, "snapshot") } });
    cms.fetchPageContent.mockResolvedValue({ source: "cms", found: false, images: {} });
    const { result } = renderHook(() => usePageMedia("home"));
    expect(result.current("hero", FALLBACK)).toBe(url("snapshot"));
    await waitFor(() => expect(result.current("hero", FALLBACK)).toBe(fallback));
  });

  it("keeps the snapshot when the CMS request failed", async () => {
    cms.getPageContentSync.mockReturnValue({ source: "snapshot", found: true, images: { hero: doc(1, "snapshot") } });
    const failed = { source: "snapshot", found: true, images: { hero: doc(1, "snapshot") } };
    cms.fetchPageContent.mockResolvedValue(failed);
    const { result } = renderHook(() => usePageMedia("home"));
    await act(async () => {});
    expect(result.current("hero", FALLBACK)).toBe(url("snapshot"));
  });

  it("shows no image for a slot the editor emptied and the code image for an unknown slot", async () => {
    cms.fetchPageContent.mockResolvedValue({ source: "cms", found: true, images: { hero: null } });
    const { result } = renderHook(() => usePageMedia("home"));
    await waitFor(() => expect(result.current("hero", FALLBACK)).toBeNull());
    expect(result.current("missing", FALLBACK)).toBe(fallback);
  });
});

describe("usePageMedia live preview", () => {
  it("resolves an image slot sent as a bare id instead of showing the code fallback", async () => {
    const { result } = await renderPublished();
    send([{ key: "hero", image: 7 }]);
    expect(result.current("hero", FALLBACK)).toBe(url("gammal"));
    expect(media.fetchMediaById).toHaveBeenCalledWith(7);

    send([{ key: "hero", image: 42 }]);
    await waitFor(() => expect(result.current("hero", FALLBACK)).toBe(url("bild-42")));
  });

  it("keeps a swapped image when a later message only changes text", async () => {
    const { result } = await renderPublished();
    send([{ key: "hero", image: 42 }]);
    await waitFor(() => expect(result.current("hero", FALLBACK)).toBe(url("bild-42")));
    send([{ key: "hero", image: 42 }], { copy: [{ key: "hero.title", value: "Ny rubrik" }] });
    expect(result.current("hero", FALLBACK)).toBe(url("bild-42"));
  });

  it("shows no image for a cleared slot and the code image for a removed row", async () => {
    const { result } = await renderPublished();
    send([{ key: "hero", image: null }]);
    expect(result.current("hero", FALLBACK)).toBeNull();
    expect(result.current("detail", FALLBACK)).toBe(fallback);
  });

  it("follows slots by key when rows are reordered", async () => {
    const { result } = await renderPublished();
    send([
      { key: "detail", image: published.images.detail },
      { key: "hero", image: published.images.hero },
    ]);
    expect(result.current("hero", FALLBACK)).toBe(url("gammal"));
    expect(result.current("detail", FALLBACK)).toBe(url("detalj"));
  });

  it("returns to the published images when the editor resets the form", async () => {
    const { result } = await renderPublished();
    send([{ key: "hero", image: 42 }, { key: "detail", image: null }]);
    await waitFor(() => expect(result.current("hero", FALLBACK)).toBe(url("bild-42")));
    send([{ key: "hero", image: 7 }, { key: "detail", image: 8 }]);
    await waitFor(() => expect(result.current("hero", FALLBACK)).toBe(url("bild-7")));
    expect(result.current("detail", FALLBACK)).toBe(url("bild-8"));
  });

  it("ignores a late lookup for an image the editor has already replaced", async () => {
    const pending = { 42: deferred(), 43: deferred() };
    media.fetchMediaById.mockImplementation((id) => pending[id].promise);
    const { result } = await renderPublished();
    send([{ key: "hero", image: 42 }]);
    send([{ key: "hero", image: 43 }]);
    await act(async () => pending[43].resolve(doc(43, "bild-43")));
    await act(async () => pending[42].resolve(doc(42, "bild-42")));
    expect(result.current("hero", FALLBACK)).toBe(url("bild-43"));
  });

  it("ignores a page response that arrives after the editor's form data", async () => {
    const page = deferred();
    cms.fetchPageContent.mockReturnValue(page.promise);
    const { result } = renderHook(() => usePageMedia("home"));
    send([{ key: "hero", image: doc(42, "bild-42") }]);
    await act(async () => page.resolve(published));
    expect(result.current("hero", FALLBACK)).toBe(url("bild-42"));
  });
});
