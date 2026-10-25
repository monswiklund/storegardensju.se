import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ContactPage from "./ContactPage.jsx";
import * as scrollUtils from "../utils/scrollUtils.js";

vi.mock("../hooks/useSeo.js", () => ({
  useSeo: vi.fn(),
}));

function renderPage() {
  window.matchMedia = vi.fn(() => ({ matches: false }));
  return render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>
  );
}

const follows = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("ContactPage", () => {
  // Renders the real form: a mocked one hid that /kontakt once opened with the form closed.
  it("shows the form right under the hero, then the address, then where to go next", () => {
    const { container } = renderPage();

    const name = screen.getByLabelText(/Namn/);
    const hero = container.querySelector(".contact-page__hero");
    const arrival = screen.getByRole("heading", { level: 2, name: "Hitta hit" });
    const explore = container.querySelector(".explore-more");

    expect(follows(hero, name)).toBe(true);
    expect(follows(name, arrival)).toBe(true);
    expect(follows(arrival, explore)).toBe(true);
    expect(screen.getByRole("link", { name: /storegardensju@gmail\.com/ })).toHaveAttribute(
      "href",
      "mailto:storegardensju@gmail.com"
    );
    expect(container.querySelector(".contact-page__map-link")).toHaveAttribute(
      "href",
      expect.stringContaining("maps.google.com")
    );
    expect(within(explore).getByRole("link", { name: /Gruppdagar/ })).toHaveAttribute("href", "/gruppdagar/");
  });

  it("has no complementary landmark nested inside main", () => {
    renderPage();

    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("scrolls from the hero's main button to the form", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");
    const { container } = renderPage();

    const cta = container.querySelector('.contact-page__hero a[href="#kontakt-formular"]');
    expect(cta).toHaveClass("btn--light");
    fireEvent.click(cta);

    expect(smoothScrollSpy).toHaveBeenCalledWith(".contact-container", 80);
  });
});
