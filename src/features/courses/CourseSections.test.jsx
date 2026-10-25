import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  ContactSection,
  NoUpcomingSection,
  PassSection,
  PastPassesSection,
  YogaScheduleSection,
} from "./CourseSections.jsx";
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

describe("courses that meet several times", () => {
  const course = (id, starts) => projectEvent({
    id,
    category: "yoga",
    title: `Kurs ${id}`,
    startAt: starts[0],
    sessions: starts.map((startAt) => ({ startAt, endAt: startAt.replace("T16", "T17") })),
  });
  const single = (id, startAt) => projectEvent({ id, category: "yoga", title: `Pass ${id}`, startAt });

  it("shows a course as one card with its calendar, every session's anchor landing on it", () => {
    const passes = schedulePasses({
      events: [course(1, ["2026-09-01T16:00:00.000Z", "2026-09-03T16:00:00.000Z", "2026-09-08T16:00:00.000Z"])],
      coursePasses: [],
    });
    const { container } = render(<BrowserRouter><YogaScheduleSection passes={passes} /></BrowserRouter>);

    const cards = container.querySelectorAll(".kurser-schedule-card");
    expect(cards).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Kurs 1" })).toBeInTheDocument();
    expect(screen.getByText(/1–8 sep · 3 tillfällen/)).toBeInTheDocument();
    for (const anchor of ["yoga-1-september", "yoga-3-september", "yoga-8-september"]) {
      expect(cards[0].contains(document.getElementById(anchor))).toBe(true);
    }
  });

  it("follows the course's drop-in box: drop-in needs no sign-up, otherwise the card asks for one", () => {
    const starts = ["2026-09-01T16:00:00.000Z", "2026-09-08T16:00:00.000Z"];
    const passes = schedulePasses({
      events: [{ ...course(1, starts), dropIn: true }, { ...course(2, starts.map((at) => at.replace("09-", "10-"))), dropIn: false }],
      coursePasses: [],
    });
    const { container } = render(<BrowserRouter><YogaScheduleSection passes={passes} /></BrowserRouter>);

    const [dropIn, signUp] = container.querySelectorAll(".kurser-schedule-card");
    expect(dropIn).toHaveTextContent(/drop-in/i);
    expect(dropIn.querySelector("a, button.btn")).toBeNull();
    expect(signUp).toHaveTextContent(/föranmälan/i);
    expect(signUp.querySelector("a")).not.toBeNull();
  });

  it("strikes a called-off session in the calendar and counts only the ones that take place", () => {
    const starts = ["2026-09-01T16:00:00.000Z", "2026-09-08T16:00:00.000Z", "2026-09-15T16:00:00.000Z"];
    const event = course(1, starts);
    event.sessions[1].cancelled = true;
    const passes = schedulePasses({ events: [event], coursePasses: [] });
    const { container } = render(<BrowserRouter><YogaScheduleSection passes={passes} /></BrowserRouter>);

    expect(screen.getByText(/1–15 sep · 2 tillfällen/)).toBeInTheDocument();
    const cancelled = container.querySelectorAll(".upcoming-schedule-session.is-cancelled");
    expect(cancelled).toHaveLength(1);
    expect(cancelled[0]).toHaveTextContent("8 sep");
    expect(cancelled[0]).toHaveTextContent("Inställt");
    expect(container.querySelector(".kurser-schedule-card").dataset.status).toBe("open");
  });

  it("closes sign-up on a course that is called off or full", () => {
    const starts = ["2026-09-01T16:00:00.000Z", "2026-09-08T16:00:00.000Z"];
    const passes = schedulePasses({
      events: [{ ...course(1, starts), status: "cancelled" }, { ...course(2, starts.map((at) => at.replace("09-", "10-"))), status: "fully_booked" }],
      coursePasses: [],
    });
    const { container } = render(<BrowserRouter><YogaScheduleSection passes={passes} /></BrowserRouter>);

    const [cancelled, full] = container.querySelectorAll(".kurser-schedule-card");
    expect(cancelled.dataset.status).toBe("cancelled");
    expect(cancelled).toHaveTextContent("Inställt");
    expect(full).toHaveTextContent("Fullbokat");
    expect(container.querySelector(".kurser-series__action a")).toBeNull();
  });

  it("recaps a finished course as one entry and folds out passes beyond the first five", () => {
    const passes = schedulePasses({
      events: [
        course(1, ["2026-09-01T16:00:00.000Z", "2026-09-08T16:00:00.000Z"]),
        ...[2, 3, 4, 5, 6, 7].map((id) => single(id, `2026-08-${10 + id}T16:00:00.000Z`)),
      ],
      coursePasses: [],
    }).sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
    render(<BrowserRouter><PastPassesSection passes={passes} trackId={YOGA_TRACK_ID} heading="Tidigare pass" /></BrowserRouter>);

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("1–8 sep 2026 · 2 tillfällen")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Visa fler (2)" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Visa färre" })).toHaveAttribute("aria-expanded", "true");
  });
});
