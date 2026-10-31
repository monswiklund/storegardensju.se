import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArtPage from "./ArtPage.jsx";

const state = { upcoming: [], artworks: [], ceramics: [] };

vi.mock("../hooks/usePageCopy.js", () => ({
  default: () => (key, fallback = "") => ({ "hero.title": "Måleri", "hero.primary-cta": "Se kurserna", "contact.cta": "Skicka en förfrågan", "ceramics.teaser-link": "Se all keramik" })[key] ?? fallback,
  useSiteCopy: () => (key, fallback = "") => fallback || key,
}));
vi.mock("../hooks/usePageMedia.js", () => ({ default: () => (_key, fallback) => fallback }));
vi.mock("../hooks/usePageLists.js", () => ({ default: () => (_key, fallback) => fallback }));
vi.mock("../hooks/useSeo.js", () => ({ useSeo: vi.fn() }));
vi.mock("../hooks/useCmsSchedule.js", () => ({ default: () => null }));
vi.mock("../hooks/useArtworks.js", () => ({ default: () => state.artworks, useCeramics: () => state.ceramics }));
vi.mock("../data/courseEvents.js", async (importOriginal) => ({
  ...(await importOriginal()),
  upcomingPasses: () => state.upcoming,
  groupSeries: (passes) => passes.map((pass) => ({ id: pass.id, passes: [pass] })),
}));
vi.mock("../features/courses/CourseSections.jsx", async (importOriginal) => ({
  ...(await importOriginal()),
  PassSection: ({ pass }) => <section>{pass.title}</section>,
  ContactSection: () => null,
}));

const work = (id, placement = "wall") => ({
  id,
  title: `Verk ${id}`,
  placement,
  image: { url: `/verk-${id}.webp`, width: 800, height: 1000, alt: "", sizes: {} },
});

function renderPage() {
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  return render(
    <MemoryRouter>
      <ArtPage />
    </MemoryRouter>,
  );
}

const hero = () => within(document.getElementById("art-hero"));

describe("ArtPage", () => {
  afterEach(() => {
    state.upcoming = [];
    state.artworks = [];
    state.ceramics = [];
  });

  it("leads to the enquiry form when no course has a date", () => {
    renderPage();
    expect(hero().getByRole("link", { name: /Skicka en förfrågan/ })).toHaveAttribute("href", "#kontakt");
    expect(hero().queryByRole("button", { name: /Se kurserna/ })).toBeNull();
  });

  it("leads to the dated courses when there are any", () => {
    state.upcoming = [{ id: "p1", title: "Akvarell en lördag" }];
    renderPage();
    expect(hero().getByRole("button", { name: /Se kurserna/ })).toBeInTheDocument();
    expect(screen.getByText("Akvarell en lördag")).toBeInTheDocument();
  });

  it("hangs at most six of Ann's paintings and leaves out studio photos", () => {
    state.artworks = [work(1, "studio"), ...Array.from({ length: 8 }, (_, i) => work(i + 2))];
    renderPage();
    const row = document.querySelector(".art-works__row");
    expect(within(row).getAllByRole("img")).toHaveLength(6);
    expect(within(row).queryByText("Verk 1")).toBeNull();
  });

  it("drops the paintings and ceramics sections when there are none", () => {
    renderPage();
    expect(document.getElementById("anns-malningar")).toBeNull();
    expect(document.getElementById("anns-keramik")).toBeNull();
  });

  it("shows four of Ann's ceramics with a link to all of them", () => {
    state.ceramics = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      title: `Skål ${i + 1}`,
      image: { url: `/skal-${i + 1}.webp`, width: 900, height: 900, alt: "", sizes: {} },
    }));
    renderPage();
    const section = within(document.getElementById("anns-keramik"));
    expect(section.getAllByRole("img")).toHaveLength(4);
    expect(section.getByRole("link", { name: /Se all keramik \(5\)/ })).toHaveAttribute("href", "/ann/keramik/");
  });
});
