import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GalleryLightbox from "./GalleryLightbox.jsx";

const images = ["a", "b", "c"].map((id) => ({ original: `/${id}.webp`, thumbnail: `/${id}-t.webp`, filename: id, originalAlt: id }));

const renderAt = (currentIndex) => (
  <GalleryLightbox
    isOpen
    images={images}
    currentIndex={currentIndex}
    currentImage={images[currentIndex]}
    onClose={() => {}}
    onNext={() => {}}
    onPrevious={() => {}}
    onSelectImage={() => {}}
  />
);

describe("GalleryLightbox", () => {
  afterEach(() => {
    delete HTMLElement.prototype.scrollTo;
  });

  it("shows only the photos of the open category, with no category switcher of its own", () => {
    render(renderAt(0));

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(document.querySelector(".lightbox-category-btn")).toBeNull();
  });

  it("scrolls the thumbnail strip to the photo being shown", () => {
    const scrollTo = vi.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    const { rerender } = render(renderAt(0));
    scrollTo.mockClear();

    rerender(renderAt(2));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo.mock.contexts[0]).toBe(document.querySelector(".lightbox-thumbnails"));
  });
});
