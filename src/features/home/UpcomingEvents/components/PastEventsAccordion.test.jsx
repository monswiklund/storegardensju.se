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
};

describe("PastEventsAccordion history", () => {
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
