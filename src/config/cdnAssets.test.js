import { describe, expect, it } from "vitest";
import { cdnAsset } from "./cdnAssets.js";

describe("cdnAsset", () => {
  it("maps legacy site images to WebP on the media CDN", () => {
    expect(cdnAsset("/images/event/hero/hero.webp")).toMatch(
      /^https:\/\/pub-[^.]+\.r2\.dev\/media-[a-f0-9]+\.webp$/
    );
  });

  it("leaves CMS and external URLs unchanged", () => {
    const url = "https://cms.storegardensju.se/media/image.webp";
    expect(cdnAsset(url)).toBe(url);
  });
});
