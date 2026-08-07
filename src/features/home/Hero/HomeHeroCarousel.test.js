import { describe, expect, it } from "vitest";
import { getHomeCarouselSlides } from "./HomeHeroCarousel";

describe("getHomeCarouselSlides", () => {
  it("uses the first 20 usable images from Alla bilder", () => {
    const images = Array.from({ length: 25 }, (_, index) => ({
      id: `image-${index + 1}`,
      path: `/images/gallery/image-${index + 1}.webp`,
      order: index + 1,
    }));

    const slides = getHomeCarouselSlides({
      categories: [
        {
          id: "alla",
          name: "Alla bilder",
          images,
        },
      ],
    });

    expect(slides).toHaveLength(20);
    expect(slides[0]).toBe("/images/gallery/image-1.webp");
    expect(slides[19]).toBe("/images/gallery/image-20.webp");
  });
});
