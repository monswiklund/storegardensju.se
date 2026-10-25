import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PastEventsAccordion from "./PastEventsAccordion.jsx";

const event = {
  id: "sommarkvall",
  title: "Sommarkväll",
  date: "13 juli 2026",
  time: "18:00",
  location: "Storegården 7",
  description: "En kväll på gården.",
  category: "marknad",
};

describe("PastEventsAccordion history", () => {
  it("shows the newest 8 events and the rest behind Visa fler", () => {
    const events = Array.from({ length: 10 }, (_, index) => ({
      ...event,
      id: `event-${index}`,
      title: `Evenemang ${index + 1}`,
      startAt: `2026-0${9 - Math.floor(index / 2)}-01T10:00:00Z`,
    }));

    render(
      <BrowserRouter>
        <PastEventsAccordion events={events} />
      </BrowserRouter>
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    fireEvent.click(screen.getByRole("button", { name: /Visa fler \(2\)/i }));
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.getByRole("button", { name: /Visa färre/i })).toBeInTheDocument();
  });

  it("lists events under their year with the kind of event", () => {
    render(
      <BrowserRouter>
        <PastEventsAccordion
          events={[
            { id: "keramik-1", title: "Helgkurs Keramik", category: "keramik", date: "22 November 2024", startAt: "2024-11-22T10:00:00Z" },
            { id: "konst-1", title: "Konstafton 2025", category: "kultur", date: "1 November 2025", startAt: "2025-11-01T10:00:00Z" },
          ]}
        />
      </BrowserRouter>
    );

    expect(screen.getByRole("region", { name: "2025" })).toHaveTextContent(/1 november.*Konstafton 2025.*Evenemang/);
    expect(screen.getByRole("region", { name: "2024" })).toHaveTextContent(/22 november.*Helgkurs Keramik.*Kurs/);
  });

  it("V34 closes the home past-event overlay on Back before leaving the route", async () => {
    window.history.replaceState({}, "", "/fore");
    window.history.pushState({}, "", "/");

    render(
      <BrowserRouter>
        <PastEventsAccordion events={[event]} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Sommarkväll/ }));
    expect(window.location.search).toBe("?pastEvent=sommarkvall");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(window.location.pathname).toBe("/");
      expect(window.location.search).toBe("");
    });

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/fore");
    });
  });
});
