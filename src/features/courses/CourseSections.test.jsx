import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PastPassesSection } from "./CourseSections.jsx";
import {
  COURSE_PASSES,
  MALERI_TRACK_ID,
} from "../../data/courseEvents.js";

describe("PastPassesSection history", () => {
  it("V34 closes the Konst/Yoga recap on Back before leaving the route", async () => {
    window.history.replaceState({}, "", "/fore");
    window.history.pushState({}, "", "/kurser/konst");
    const pass = COURSE_PASSES.find(
      (item) => item.id === "heldag-yoga-maleri-2026-07-13"
    );

    render(
      <BrowserRouter>
        <PastPassesSection
          passes={[pass]}
          trackId={MALERI_TRACK_ID}
          heading="Tidigare kurser"
        />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: pass.title }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(window.location.pathname).toBe("/kurser/konst");
    });

    act(() => {
      window.history.back();
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/fore");
    });
  });
});
