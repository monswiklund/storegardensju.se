import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MohippaPage from "./MohippaPage.jsx";

const COPY = {
  "calc.tab-addons": "Tillval",
  "calc.add-addon": "Lägg till",
  "calc.send-inquiry": "Skicka förfrågan",
  "calc.estimated-total": "Uppskattat totalpris:",
  "activities.items.yoga.title": "Yoga",
};

vi.mock("../hooks/usePageCopy.js", () => ({
  default: () => (key, fallback = "") => COPY[key] ?? fallback,
}));
vi.mock("../hooks/usePageMedia.js", () => ({ default: () => (_key, fallback) => fallback }));
vi.mock("../hooks/usePageLists.js", () => ({ default: () => (_key, fallback) => fallback }));
vi.mock("../hooks/useSeo.js", () => ({ useSeo: vi.fn() }));
vi.mock("../features/home", () => ({ HomeServicesSection: () => null }));

describe("MohippaPage inquiry", () => {
  it("puts each chosen add-on's price and a single colon in the mail", () => {
    window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));

    render(
      <MemoryRouter>
        <MohippaPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Tillval" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Lägg till" })[0]);

    const mail = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .find((href) => href?.startsWith("mailto:") && href.includes("body="));
    const body = decodeURIComponent(mail.split("body=")[1]);

    expect(body).toContain("- Yoga (200 kr/person)");
    // sv-SE groups thousands with a no-break space.
    expect(body).toMatch(/Uppskattat totalpris: 7\s000 kr \(700 kr\/person\)/);
    expect(body).not.toContain("::");
    expect(screen.getByText("1 h")).toBeInTheDocument();
  });
});
