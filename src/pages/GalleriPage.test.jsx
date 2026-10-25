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
  it("keeps the hero's picture button on the page, pointing at the images", async () => {
    render(
      <MemoryRouter>
        <GalleriPage />
      </MemoryRouter>
    );

    const cta = screen.getByRole("link", { name: /Se alla bilder/ });
    expect(cta).toHaveAttribute("href", "#gallery-heading");
    expect(await screen.findByRole("heading", { name: "Bilder" })).toBeInTheDocument();
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
