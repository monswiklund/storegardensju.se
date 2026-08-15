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
  it("shows up to 5 events initially and displays an expand button when more exist", () => {
    const events = Array.from({ length: 8 }, (_, index) => ({
      ...event,
      id: `event-${index}`,
      title: `Evenemang ${index + 1}`,
      category: "marknad",
    }));

    render(
      <BrowserRouter>
        <PastEventsAccordion events={events} />
      </BrowserRouter>
    );

    // Initial limit should display 5 items
    const expandButton = screen.getByRole("button", { name: /Visa fler/i });
    expect(expandButton).toBeInTheDocument();
    expect(screen.getByText(/Visa fler \(3\)/)).toBeInTheDocument();

    // Clicking expand button displays all 8 items and turns into "Visa färre"
    fireEvent.click(expandButton);
    expect(screen.getByRole("button", { name: /Visa färre/i })).toBeInTheDocument();
  });

  it("filters events when clicking category filter pills", () => {
    const mixedEvents = [
      {
        id: "yoga-1",
        title: "Yogapass",
        category: "yoga",
        date: "12 Aug 2026",
      },
      {
        id: "keramik-1",
        title: "Helgkurs Keramik",
        category: "keramik",
        date: "10 Aug 2026",
      },
      {
        id: "marknad-1",
        title: "Konstafton 2025",
        category: "marknad",
        date: "1 Nov 2025",
      },
    ];

    render(
      <BrowserRouter>
        <PastEventsAccordion events={mixedEvents} />
      </BrowserRouter>
    );

    // Click on Yoga filter pill
    const yogaFilter = screen.getAllByRole("tab", { name: /Yoga/i })[0];
    fireEvent.click(yogaFilter);

    // Yoga item should be visible, keramik and konstafton should not
    expect(screen.getByRole("button", { name: /Yogapass/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Helgkurs Keramik/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Konstafton/i })).not.toBeInTheDocument();
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
