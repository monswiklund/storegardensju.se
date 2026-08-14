import { fireEvent, render, screen } from "@testing-library/react";
import GalleryGrid from "./GalleryGrid";

const images = Array.from({ length: 30 }, (_, index) => ({
  filename: `bild-${index + 1}.webp`,
  thumbnail: `/bilder/bild-${index + 1}.webp`,
  thumbnailAlt: `Bild ${index + 1}`,
}));

describe("GalleryGrid", () => {
  it("renders images in batches instead of loading the full gallery", () => {
    const { container } = render(
      <GalleryGrid images={images} onImageSelect={() => {}} />
    );

    expect(container.querySelectorAll("img")).toHaveLength(12);

    fireEvent.click(screen.getByRole("button", { name: "Visa fler bilder (12)" }));
    expect(container.querySelectorAll("img")).toHaveLength(24);

    fireEvent.click(screen.getByRole("button", { name: "Visa fler bilder (6)" }));
    expect(container.querySelectorAll("img")).toHaveLength(30);
    expect(
      screen.queryByRole("button", { name: /Visa fler bilder/ })
    ).not.toBeInTheDocument();
  });
});
