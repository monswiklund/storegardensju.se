import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import EventCard from "./EventCard.jsx";

const event = {
  id: "16",
  title: "Konstafton 2026",
  description: "Besök keramikbutiken och ateljén.",
  date: "31 Oktober 2026",
  time: "12:00 - 23:59",
  location: "Storegården 7, Rackeby",
  artists: "Ann, Caroline & Lina",
  links: [{ href: "https://konstafton.se/", label: "Läs mer på konstafton.se" }],
  image: { src: "/a.webp", alt: "Fågel" },
  images: [
    { src: "/a.webp", alt: "Fågel" },
    { src: "/b.webp", alt: "Örn" },
    { src: "/c.webp", alt: "Siluett" },
  ],
};

describe("EventCard", () => {
  it("shows the description and opens the whole event with every photo", () => {
    render(
      <MemoryRouter>
        <EventCard event={event} />
      </MemoryRouter>,
    );

    expect(screen.getByText(event.description)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Visa hela evenemanget: Konstafton 2026/ }));

    const dialog = screen.getByRole("dialog", { name: "Konstafton 2026" });
    expect(within(dialog).getByText(/Ann, Caroline & Lina/)).toBeInTheDocument();
    expect(dialog.querySelectorAll(".carousel-dot")).toHaveLength(3);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Konstafton 2026" })).toBeNull();
  });
});
