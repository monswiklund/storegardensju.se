import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ContactPage from "./ContactPage.jsx";

vi.mock("../features/contact", () => ({
  ContactSection: () => (
    <section data-testid="contact-form-section">Kontaktformulär</section>
  ),
}));

vi.mock("../hooks/useSeo.js", () => ({
  useSeo: vi.fn(),
}));

describe("ContactPage", () => {
  it("places the internal next-step links after the contact form", () => {
    window.matchMedia = vi.fn(() => ({ matches: false }));

    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    const form = screen.getByTestId("contact-form-section");
    const explore = document.getElementById("contact-explore-more");

    expect(explore).toBeInTheDocument();
    expect(
      form.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: /Bröllop & fest/ })).toHaveAttribute(
      "href",
      "/event/brollop/"
    );
    expect(screen.getByRole("link", { name: /Gruppdagar/ })).toHaveAttribute(
      "href",
      "/gruppdagar/"
    );
  });
});
