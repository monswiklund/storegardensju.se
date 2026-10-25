import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import TeamPage from "./TeamPage.jsx";
import { profiles } from "../data/profileData.js";

vi.mock("../features/contact", () => ({
  ContactSection: () => (
    <section data-testid="contact-form-section">Kontaktformulär</section>
  ),
}));

vi.mock("../hooks/useSeo.js", () => ({
  useSeo: vi.fn(),
}));

vi.mock("../services/cmsService.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchTeamMembers: vi.fn(() =>
    Promise.resolve([
      { id: 1, slug: "ann", name: "Ann Wiklund", role: "Konstnär", bio: "Bio från CMS." },
      { id: 2, slug: "lina", name: "Lina Wiklund", role: "Planering", bio: "  " },
      // No slug: matched on the first name without its diacritics.
      { id: 3, name: "Måns Wiklund", role: "Utvecklare" },
    ])
  ),
}));

// The fallback team renders first; the CMS list replaces it once its bio shows.
const renderPage = async () => {
  const result = render(
    <MemoryRouter>
      <TeamPage />
    </MemoryRouter>
  );
  await screen.findByText("Bio från CMS.");
  return result;
};

describe("TeamPage", () => {
  it("shows the family from the CMS, Måns included", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { name: "Lina Wiklund" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ann Wiklund" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Måns Wiklund" })).toBeInTheDocument();
  });

  it("falls back to the profileData bio when the CMS bio is empty", async () => {
    await renderPage();

    expect(screen.getByText(profiles.lina.texts[0])).toBeInTheDocument();
  });

  it("steps heading levels one at a time", async () => {
    await renderPage();

    const levels = screen
      .getAllByRole("heading")
      .map((heading) => Number(heading.tagName.slice(1)));
    levels.forEach((level, index) => {
      if (index > 0) expect(level - levels[index - 1]).toBeLessThanOrEqual(1);
    });
  });

  it("ends with where to go next, then the page's one form", async () => {
    const { container } = await renderPage();

    const grid = container.querySelector(".team-grid");
    const explore = container.querySelector(".explore-more");
    const forms = screen.getAllByTestId("contact-form-section");

    expect(forms).toHaveLength(1);
    expect(grid.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(explore.compareDocumentPosition(forms[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
