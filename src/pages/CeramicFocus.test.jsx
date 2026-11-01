import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CeramicFocus from "./CeramicFocus.jsx";

vi.mock("../hooks/usePageCopy.js", () => ({
  default: () => (key, fallback = "") => fallback || key,
  useSiteCopy: () => (key, fallback = "") => fallback || key,
}));

const piece = (id, title) => ({
  id,
  title,
  type: "skal",
  image: { url: `https://cms.example.test/keramik-${id}.webp`, width: 1500, height: 2000, alt: `${title} av Ann Wiklund` },
});

const pieces = [piece(1, "Skålar i blått"), piece(2, "Muggar med relief")];

function setup({ email = "ann@example.test" } = {}) {
  const lightbox = {
    isOpen: true,
    currentIndex: 1,
    closeLightbox: vi.fn(),
    goToNextImage: vi.fn(),
    goToPreviousImage: vi.fn(),
  };
  // No tile to fly back to, so closing is immediate.
  render(<CeramicFocus lightbox={lightbox} pieces={pieces} tileFor={() => null} email={email} ask="Fråga om keramiken" />);
  return lightbox;
}

describe("CeramicFocus", () => {
  it("asks about the piece shown, by name", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Muggar med relief" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Fråga om keramiken" }).getAttribute("href")).toBe(
      `mailto:ann@example.test?subject=${encodeURIComponent('Fråga om keramiken "Muggar med relief"')}`,
    );
  });

  it("closes from the backdrop but not from the photo itself", () => {
    const lightbox = setup();
    fireEvent.click(screen.getByRole("img"));
    expect(lightbox.closeLightbox).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("img").closest("figure"));
    expect(lightbox.closeLightbox).toHaveBeenCalledTimes(1);
  });

  it("steps between pieces and leaves out the ask link without an address", () => {
    const lightbox = setup({ email: "" });
    fireEvent.click(screen.getByRole("button", { name: "ui.next-image" }));
    expect(lightbox.goToNextImage).toHaveBeenCalled();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
