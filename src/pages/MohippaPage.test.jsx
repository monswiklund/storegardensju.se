import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import MohippaPage from "./MohippaPage.jsx";

const COPY = {
  "calc.tab-addons": "Tillval",
  "calc.add-addon": "Lägg till",
  "calc.send-inquiry": "Skicka förfrågan",
  "calc.estimated-total": "Uppskattat totalpris:",
  "activities.items.yoga.title": "Yoga",
};
const editorCopy = {};

vi.mock("../hooks/usePageCopy.js", () => ({
  default: () => (key, fallback = "") => editorCopy[key] ?? COPY[key] ?? fallback,
  useSiteCopy: () => (key, fallback = "") => fallback || key,
}));
vi.mock("../hooks/usePageMedia.js", () => ({ default: () => (_key, fallback) => fallback }));
vi.mock("../hooks/usePageLists.js", () => ({ default: () => (_key, fallback) => fallback }));
vi.mock("../hooks/useSeo.js", () => ({ useSeo: vi.fn() }));
vi.mock("../features/home", () => ({ HomeServicesSection: () => null }));

function chooseYoga() {
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  render(
    <MemoryRouter>
      <MohippaPage />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole("button", { name: "Tillval" }));
  fireEvent.click(screen.getAllByRole("button", { name: "Lägg till" })[0]);
  const link = screen.getByRole("link", { name: /Skicka förfrågan/ });
  return { link, body: decodeURIComponent(link.getAttribute("href").split("body=")[1]) };
}

describe("MohippaPage inquiry", () => {
  afterEach(() => {
    for (const key of Object.keys(editorCopy)) delete editorCopy[key];
  });

  it("puts each chosen add-on's price and a single colon in the mail", () => {
    const { body } = chooseYoga();

    expect(body).toContain("- Yoga (200 kr/person)");
    // sv-SE groups thousands with a no-break space.
    expect(body).toMatch(/Uppskattat totalpris: 7\s000 kr \(700 kr\/person\)/);
    expect(body).not.toContain("::");
    expect(screen.getByText("1 h")).toBeInTheDocument();
  });

  it("calculates with the prices the editor set in the CMS", () => {
    editorCopy["calc.base-price-kr"] = "600";
    editorCopy["activities.items.yoga.price-kr"] = "250";
    const { body } = chooseYoga();

    expect(document.body.textContent).toContain("+ 250 kr/person");
    expect(body).toContain("(600 kr/person)");
    expect(body).toContain("- Yoga (250 kr/person)");
    expect(body).toMatch(/Uppskattat totalpris: 8\s500 kr \(850 kr\/person\)/);
  });

  it("offers the address and the text to copy once the mail link is used", () => {
    const { link } = chooseYoga();
    fireEvent.click(link);

    expect(screen.getByRole("status")).toHaveTextContent("bylinawiklund@gmail.com");
  });
});
