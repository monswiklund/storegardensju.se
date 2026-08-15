import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import EventPage from "./EventPage.jsx";
import * as scrollUtils from "../../utils/scrollUtils.js";

vi.mock("../../hooks/useSeo.js", () => ({
  useSeo: vi.fn(),
}));

vi.mock("../../features/home", () => ({
  HomeServicesSection: () => <section>Services</section>,
}));

describe("EventPage", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    delete window.storegardenLenis;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete window.storegardenLenis;
  });

  it("smoothly scrolls down to event-details-section when 'Se eventtyper' is clicked", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");

    render(
      <MemoryRouter>
        <EventPage />
      </MemoryRouter>
    );

    const ctaButton = screen.getByRole("link", { name: /Se eventtyper/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute("href", "#event-details-section");

    fireEvent.click(ctaButton);

    expect(smoothScrollSpy).toHaveBeenCalledWith("event-details-section", 130);
  });

  it("smoothly scrolls to in-page section when in-page anchor card is clicked", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");

    render(
      <MemoryRouter>
        <EventPage />
      </MemoryRouter>
    );

    const celebrationCard = screen.getByRole("link", {
      name: /Fest & företagsevent/i,
    });
    expect(celebrationCard).toBeInTheDocument();
    expect(celebrationCard).toHaveAttribute("href", "#event-loft-section");

    fireEvent.click(celebrationCard);

    expect(smoothScrollSpy).toHaveBeenCalledWith("#event-loft-section", 130);
  });

  it("renders router Links for sub-routes like wedding and group days", () => {
    render(
      <MemoryRouter>
        <EventPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /Bröllop/i })).toHaveAttribute(
      "href",
      "/event/brollop/"
    );
    expect(screen.getByRole("link", { name: /Gruppdagar/i })).toHaveAttribute(
      "href",
      "/gruppdagar/"
    );
  });
});
