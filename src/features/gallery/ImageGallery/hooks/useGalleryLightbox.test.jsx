import { act, renderHook, waitFor } from "@testing-library/react";
import useGalleryLightbox from "./useGalleryLightbox";

const images = [
  {
    original: "/images/gallery/first.webp",
    thumbnail: "/images/gallery/first-thumb.webp",
  },
];

describe("useGalleryLightbox history", () => {
  it("V31 closes on Back before navigating the route history", async () => {
    window.history.replaceState({}, "", "/fore");
    window.history.pushState({}, "", "/galleri");

    const { result } = renderHook(() =>
      useGalleryLightbox(images, "gallery")
    );

    act(() => {
      result.current.openLightbox(0);
    });

    expect(result.current.isOpen).toBe(true);
    expect(window.location.pathname).toBe("/galleri");

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(false);
      expect(window.location.pathname).toBe("/galleri");
    });

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/fore");
    });
  });

  it("V31 removes the transient entry when closed explicitly", async () => {
    window.history.replaceState({}, "", "/fore");
    window.history.pushState({}, "", "/kurser");

    const { result } = renderHook(() =>
      useGalleryLightbox(images, "courses")
    );

    act(() => {
      result.current.openLightbox(0);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeLightbox();
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(false);
      expect(window.location.pathname).toBe("/kurser");
    });

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/fore");
    });
  });
});
