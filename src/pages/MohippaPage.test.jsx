import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import MohippaPage from "./MohippaPage.jsx";
import * as scrollUtils from "../utils/scrollUtils.js";

const COPY = {
  "hero.title-prefix": "Er",
  "hero.title-suffix": "på Storegården 7",
  "calc.tab-base": "Baspaket",
  "calc.tab-addons": "Tillval",
  "calc.add-addon": "Lägg till",
  "calc.addon-selected": "Tillagd",
  "calc.send-inquiry": "Skicka förfrågan",
  "calc.estimated-total": "Uppskattat totalpris:",
  "calc.guests-label": "Antal personer",
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

function renderPage() {
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  return render(
    <MemoryRouter>
      <MohippaPage />
    </MemoryRouter>
  );
}

function chooseYoga() {
  const view = renderPage();
  fireEvent.click(screen.getByRole("tab", { name: "Tillval" }));
  fireEvent.click(screen.getByRole("button", { name: "Lägg till: Yoga" }));
  return view;
}

/** Clicks the calculator's send button and returns what it handed to the enquiry form. */
function sendInquiry() {
  const requests = [];
  const onRequest = (event) => requests.push(event.detail);
  window.addEventListener("expand-contact-form", onRequest);
  const link = screen.getByRole("link", { name: /Skicka förfrågan/ });
  fireEvent.click(link);
  window.removeEventListener("expand-contact-form", onRequest);
  return { link, requests };
}

describe("MohippaPage", () => {
  afterEach(() => {
    for (const key of Object.keys(editorCopy)) delete editorCopy[key];
    vi.restoreAllMocks();
  });

  it("names every occasion in the heading, Möhippa first", () => {
    renderPage();

    // The accessible name skips the aria-hidden rotating word and reads the full list once.
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Er Möhippa, Svensexa, Teambuilding, Afterwork eller Workshop på Storegården 7",
      })
    ).toBeInTheDocument();
  });

  it("sends the request through the site's form with Gruppdagar chosen and the day attached", () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, "smoothScrollTo");
    chooseYoga();
    const { link, requests } = sendInquiry();

    expect(link).toHaveAttribute("href", "#site-contact");
    expect(smoothScrollSpy).toHaveBeenCalledWith(".contact-container", 70);
    expect(requests).toHaveLength(1);
    expect(requests[0].subject).toBe("group");
    expect(requests[0].message).toContain("- Yoga (200 kr/person)");
    // sv-SE groups thousands with a no-break space.
    expect(requests[0].message).toMatch(/Uppskattat totalpris: 7\s000 kr \(700 kr\/person\)/);
    expect(requests[0].message).not.toContain("::");
    expect(screen.getByText("1 h")).toBeInTheDocument();
  });

  it("calculates with the prices the editor set in the CMS", () => {
    editorCopy["calc.base-price-kr"] = "600";
    editorCopy["activities.items.yoga.price-kr"] = "250";
    chooseYoga();
    const { requests } = sendInquiry();

    expect(document.body.textContent).toContain("+ 250 kr/person");
    expect(requests[0].message).toContain("(600 kr/person)");
    expect(requests[0].message).toContain("- Yoga (250 kr/person)");
    expect(requests[0].message).toMatch(/Uppskattat totalpris: 8\s500 kr \(850 kr\/person\)/);
  });

  it("no longer mails a private inbox", () => {
    const { container } = chooseYoga();
    sendInquiry();

    expect(container.innerHTML).not.toContain("bylinawiklund");
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("exposes the planner as tabs and the add-ons as toggle buttons", () => {
    renderPage();

    const base = screen.getByRole("tab", { name: "Baspaket" });
    const addons = screen.getByRole("tab", { name: "Tillval" });
    expect(base).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", base.id);

    fireEvent.keyDown(base, { key: "ArrowRight" });
    expect(addons).toHaveAttribute("aria-selected", "true");
    expect(addons).toHaveFocus();

    const yoga = screen.getByRole("button", { name: "Lägg till: Yoga" });
    expect(yoga).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(yoga);
    expect(screen.getByRole("button", { name: "Tillagd: Yoga" })).toHaveAttribute("aria-pressed", "true");
  });

  it("ends with the explore block without a card for group days", () => {
    const { container } = renderPage();

    const explore = container.querySelector(".explore-more");
    expect(explore).toBeInTheDocument();
    const targets = within(explore).getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(targets).not.toContain("/gruppdagar/");
  });
});
