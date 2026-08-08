import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ExploreMoreSection from "./ExploreMoreSection.jsx";

const items = [
  {
    to: "/event/",
    eyebrow: "Planera",
    title: "Event",
    text: "Boka gården för nästa tillställning.",
    featured: true,
  },
  {
    to: "/galleri/",
    eyebrow: "Se gården",
    title: "Galleri",
    text: "Titta närmare på platsen.",
  },
];

describe("ExploreMoreSection", () => {
  it("renders an accessible heading and internal CTA links", () => {
    render(
      <MemoryRouter>
        <ExploreMoreSection
          id="test-explore"
          title="Utforska mer"
          intro="Hitta nästa steg."
          items={items}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Utforska mer" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Event/ })).toHaveAttribute(
      "href",
      "/event/"
    );
    expect(screen.getByRole("link", { name: /Galleri/ })).toHaveAttribute(
      "href",
      "/galleri/"
    );
    expect(screen.getByRole("link", { name: /Event/ })).toHaveClass(
      "explore-more-section__card--featured"
    );
  });
});
