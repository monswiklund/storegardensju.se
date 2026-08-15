import { describe, expect, it } from "vitest";
import { pageSlugForPath } from "./usePageAppearance";

describe("pageSlugForPath", () => {
  it.each([
    ["/", "home"],
    ["/event/", "event"],
    ["/event/brollop/", "wedding"],
    ["/gruppdagar/", "group-days"],
    ["/kurser/", "courses"],
    ["/kurser/yoga/", "yoga"],
    ["/kurser/konst/", "art"],
    ["/galleri/", "gallery"],
    ["/butik/123", "shop"],
    ["/om-oss/", "about"],
    ["/kontakt/", "contact"],
  ])("maps %s to %s", (path, slug) => {
    expect(pageSlugForPath(path)).toBe(slug);
  });
});
