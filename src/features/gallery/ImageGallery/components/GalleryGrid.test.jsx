import { act, render, screen } from "@testing-library/react";
import GalleryGrid from "./GalleryGrid";

const images = Array.from({ length: 30 }, (_, index) => ({
  filename: `bild-${index + 1}.webp`,
  thumbnail: `/bilder/bild-${index + 1}.webp`,
  thumbnailAlt: `Bild ${index + 1}`,
}));

describe("GalleryGrid", () => {
  let observerCallback = null;

  beforeEach(() => {
    observerCallback = null;
    globalThis.IntersectionObserver = class {
      constructor(callback) {
        observerCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    delete globalThis.IntersectionObserver;
  });

  it("renders images in batches and automatically loads more when sentinel intersects", () => {
    const { container } = render(
      <GalleryGrid images={images} onImageSelect={() => {}} />
    );

    // Initial batch
    expect(container.querySelectorAll("img")).toHaveLength(12);
    expect(screen.getByTestId("gallery-scroll-sentinel")).toBeInTheDocument();

    // Trigger intersection once -> loads next 12 (24)
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(container.querySelectorAll("img")).toHaveLength(24);

    // Trigger intersection again -> loads remaining 6 (30)
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(container.querySelectorAll("img")).toHaveLength(30);

    // All images rendered, sentinel should not be present
    expect(
      screen.queryByTestId("gallery-scroll-sentinel")
    ).not.toBeInTheDocument();
  });

  it("uses the original gallery source and dimensions instead of a cropped thumbnail", () => {
    const { container } = render(
      <GalleryGrid
        images={[{
          filename: "portrait.webp",
          galleryPath: "/media/portrait.webp",
          thumbnail: "/media/portrait-400x300.webp",
          thumbnailAlt: "Porträtt",
          width: 1200,
          height: 1800,
        }]}
        onImageSelect={() => {}}
      />
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/media/portrait.webp"
    );
    expect(container.querySelector("img")).toHaveAttribute("width", "1200");
    expect(container.querySelector("img")).toHaveAttribute("height", "1800");
  });
});
