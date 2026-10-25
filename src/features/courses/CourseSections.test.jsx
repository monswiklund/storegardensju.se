import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ContactSection, NoUpcomingSection, PassSection, PastPassesSection } from "./CourseSections.jsx";
import {
  MALERI_TRACK_ID,
  YOGA_TRACK_ID,
  coursePassToPass,
  eventToPass,
  schedulePasses,
} from "../../data/courseEvents.js";
import { projectCoursePass, projectEvent } from "../../data/cmsProjection.js";
import { SNAPSHOT } from "../../test/cmsScheduleFixture.js";

const COURSE_PASSES = schedulePasses(SNAPSHOT);

describe("PastPassesSection history", () => {
  it("V34 closes the Konst/Yoga recap on Back before leaving the route", async () => {
    window.history.replaceState({}, "", "/fore");
    window.history.pushState({}, "", "/kurser/konst");
    const pass = COURSE_PASSES.find(
      (item) => item.id === "course:heldag-yoga-maleri-2026-07-13"
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

describe("PassSection", () => {
  const renderPass = (pass, trackId = YOGA_TRACK_ID) =>
    render(<PassSection pass={pass} trackId={trackId} />);
  const coursePass = (doc) =>
    coursePassToPass(projectCoursePass({ id: 1, title: "Akvarell", track: "konst", startAt: "2026-09-05T08:00:00.000Z", ...doc }));

  it("shows a cancelled pass as cancelled, without a sign-up card", () => {
    renderPass(coursePass({ status: "cancelled", instructor: "ann" }), MALERI_TRACK_ID);

    expect(screen.getByText("Inställt")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /meddelande|skicka/i })).not.toBeInTheDocument();
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("shows status and spots, and sends sign-ups to the hub's enquiry form", () => {
    renderPass(coursePass({ status: "few_left", spots: 3, instructor: "ann", bookingEmail: "ateljen@example.test" }), MALERI_TRACK_ID);

    expect(screen.getByText("Fåtal platser kvar")).toBeInTheDocument();
    expect(screen.getByText(/3 /)).toBeInTheDocument();
    expect(screen.getByText("Ann Wiklund")).toBeInTheDocument();
    expect(document.querySelector('a[href="#kontakt"]')).not.toBeNull();
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("names no instructor for a guest and shows the event's own location", () => {
    renderPass(coursePass({ instructor: "guest" }), MALERI_TRACK_ID);
    expect(screen.queryByText(/Wiklund/)).not.toBeInTheDocument();

    const located = eventToPass(projectEvent({ id: 2, title: "Yoga i parken", category: "yoga", startAt: "2026-09-01T16:00:00.000Z", location: "Stadsparken" }));
    renderPass(located);
    expect(screen.getByText("Stadsparken")).toBeInTheDocument();
  });
});

describe("course enquiries", () => {
  it("ends an empty calendar on a link to the enquiry form", () => {
    render(<NoUpcomingSection trackId={YOGA_TRACK_ID} heading="Inga pass" body="Snart fler." ctaLabel="Hör av dig" />);

    expect(screen.getByRole("link", { name: /Hör av dig/ })).toHaveAttribute("href", "#kontakt");
  });

  it("renders the hub's heading over the shared form, with a course chosen and no mailto", () => {
    render(<ContactSection heading="Frågor om yogan?" body="Hör av dig." />);

    const section = document.getElementById("kontakt");
    expect(section).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Frågor om yogan?" })).toBeInTheDocument();
    expect(section.querySelector("form")).not.toBeNull();
    expect(section.querySelector('input[name="subject"]:checked')).toHaveAttribute("value", "course");
    expect(section.innerHTML).not.toContain("bylinawiklund");
  });
});
