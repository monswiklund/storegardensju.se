import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import EventPage from "./EventPage.jsx";
import WeddingPage from "./WeddingPage.jsx";
import * as scrollUtils from "../../utils/scrollUtils.js";

vi.mock("../../hooks/useSeo.js", () => ({
  useSeo: vi.fn(),
}));

function renderPage(Page) {
  return render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>
  );
}

/** Records expand-contact-form events, the hand-off to the site's enquiry form. */
function listenForFormRequests() {
  const requests = [];
  const onRequest = (event) => requests.push(event.detail);
  window.addEventListener("expand-contact-form", onRequest);
  return { requests, stop: () => window.removeEventListener("expand-contact-form", onRequest) };
}

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

describe("EventPage", () => {
  it("smoothly scrolls down to event-details-section when 'Se eventtyper' is clicked", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");
    renderPage(EventPage);

    const ctaButton = screen.getByRole("link", { name: /Se eventtyper/i });
    expect(ctaButton).toHaveAttribute("href", "#event-details-section");

    fireEvent.click(ctaButton);

    expect(smoothScrollSpy).toHaveBeenCalledWith("event-details-section", 130);
  });

  it("sends the hero's main call to action to the enquiry form after the page", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");
    const { requests, stop } = listenForFormRequests();
    const { container } = renderPage(EventPage);

    const hero = within(container.querySelector("#event-hero"));
    const cta = hero.getByRole("link", { name: /Berätta om ert event/i });
    expect(cta).toHaveAttribute("href", "#site-contact");
    fireEvent.click(cta);
    stop();

    expect(requests).toHaveLength(1);
    expect(smoothScrollSpy).toHaveBeenCalledWith(".contact-container", 130);
  });

  it("smoothly scrolls to in-page section when in-page anchor card is clicked", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");
    const { container } = renderPage(EventPage);
    const types = within(container.querySelector(".event-types-grid"));

    const celebrationCard = types.getByRole("link", { name: /Fest & företagsevent/i });
    expect(celebrationCard).toHaveAttribute("href", "#event-loft-section");

    fireEvent.click(celebrationCard);

    expect(smoothScrollSpy).toHaveBeenCalledWith("#event-loft-section", 130);
  });

  it("renders router Links for sub-routes like wedding and group days, with decorative photos", () => {
    const { container } = renderPage(EventPage);
    const types = within(container.querySelector(".event-types-grid"));

    expect(types.getByRole("link", { name: /Bröllop/i })).toHaveAttribute("href", "/event/brollop/");
    expect(types.getByRole("link", { name: /Gruppdagar/i })).toHaveAttribute("href", "/gruppdagar/");
    const photos = container.querySelectorAll(".event-type-card__image");
    expect(photos.length).toBeGreaterThan(0);
    photos.forEach((photo) => expect(photo).toHaveAttribute("alt", ""));
  });

  it("links to the gallery and ends with the explore block, without a card for itself", () => {
    const { container } = renderPage(EventPage);

    expect(screen.getByRole("link", { name: /Se galleriet/i })).toHaveAttribute("href", "/galleri/");
    const explore = container.querySelector(".explore-more");
    expect(explore).toBeInTheDocument();
    // Only the closing wave divider may follow it in <main>.
    let next = explore.parentElement.nextElementSibling;
    while (next) {
      expect(next).toHaveClass("section-divider");
      next = next.nextElementSibling;
    }
    const targets = within(explore).getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(targets).not.toContain("/event/");
    expect(targets).toContain("/event/brollop/");
  });
});

describe("WeddingPage", () => {
  it("offers the enquiry in the hero and preselects Bröllop in the form", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");
    const { requests, stop } = listenForFormRequests();
    const { container } = renderPage(WeddingPage);

    const hero = within(container.querySelector("#wedding-hero"));
    fireEvent.click(hero.getByRole("link", { name: /Skicka en bröllopsförfrågan/i }));
    stop();

    expect(requests).toEqual([{ subject: "wedding" }]);
    expect(smoothScrollSpy).toHaveBeenCalledWith(".contact-container", 130);
  });

  it("opens and closes each FAQ answer and keeps the question a heading", () => {
    renderPage(WeddingPage);

    const question = screen.getByRole("button", { name: /Får vi ta med egen mat och dryck/i });
    expect(question.closest("h3")).not.toBeNull();
    const answer = document.getElementById(question.getAttribute("aria-controls"));
    expect(question).toHaveAttribute("aria-expanded", "false");
    expect(answer).toHaveClass("wedding-faq-card__answer-wrapper");
    expect(answer).not.toHaveClass("is-open");

    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(answer).toHaveClass("is-open");

    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "false");
    expect(answer).not.toHaveClass("is-open");
  });

  it("ends with the explore block without a card for the wedding page", () => {
    const { container } = renderPage(WeddingPage);

    const explore = container.querySelector(".explore-more");
    expect(explore).toBeInTheDocument();
    const targets = within(explore).getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(targets).not.toContain("/event/brollop/");
  });
});
