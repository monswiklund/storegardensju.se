import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import GalleriPage from "./GalleriPage.jsx";

vi.mock("../hooks/useSeo.js", () => ({
  useSeo: vi.fn(),
}));

vi.mock("../features/gallery/ImageGallery/GalleryShowcase.jsx", () => ({
  default: () => <h2 id="gallery-heading">Bilder</h2>,
}));

describe("GalleriPage", () => {
  it("opens on one heading with the photos right under it, the venue note after them", async () => {
    const { container } = render(
      <MemoryRouter>
        <GalleriPage />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole("link", { name: /Se alla bilder/ })).toBeNull();
    const wall = await screen.findByRole("heading", { name: "Bilder" });
    const venue = container.querySelector(".gallery-venue");
    expect(wall.compareDocumentPosition(venue) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("ends with an enquiry step and then where to go next", () => {
    const { container } = render(
      <MemoryRouter>
        <GalleriPage />
      </MemoryRouter>
    );

    const plan = container.querySelector(".gallery-plan");
    const explore = container.querySelector(".explore-more");

    expect(plan.querySelector("button")).toBeInTheDocument();
    expect(plan.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector("main").lastElementChild.previousElementSibling).toBe(explore);
  });
});
