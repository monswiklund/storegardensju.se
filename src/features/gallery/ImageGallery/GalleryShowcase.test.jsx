import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GalleryShowcase from "./GalleryShowcase.jsx";

const photo = (id, category) => ({ id, url: `/${id}.webp`, displayName: id, category, width: 800, height: 1000 });

vi.mock("../../../services/galleryService", () => ({
  // Resolves after the first render, as the CMS answer does on the live site.
  fetchGalleryCategories: () =>
    Promise.resolve({
      categories: [
        { id: "alla", name: "Alla bilder", order: -1, images: [photo("loftet", "overvaning"), photo("ladan", "undervaning")] },
        { id: "utvalda", name: "Utvalda", order: -2, images: [photo("loftet", "overvaning")] },
        { id: "overvaning", name: "Loftet", images: [photo("loftet", "overvaning")] },
        { id: "undervaning", name: "Ladan", images: [photo("ladan", "undervaning")] },
      ],
      featured: [],
    }),
}));

describe("GalleryShowcase", () => {
  it("opens on Utvalda, the first tab, and still lets the visitor see every photo", async () => {
    const { container } = render(<GalleryShowcase />);
    const tabs = container.querySelector(".category-toggle-container");

    const picks = await within(tabs).findByRole("button", { name: /Utvalda/ });
    expect(within(tabs).getAllByRole("button")[0]).toBe(picks);
    expect(picks).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll(".gallery-grid img")).toHaveLength(1);

    fireEvent.click(within(tabs).getByRole("button", { name: /Alla bilder/ }));

    expect(within(tabs).getByRole("button", { name: /Alla bilder/ })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll(".gallery-grid img")).toHaveLength(2);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
