import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import EventDetailPage from "./EventDetailPage.jsx";

const state = { schedule: { events: [], coursePasses: [], settled: true } };

vi.mock("../hooks/usePageCopy.js", () => ({
  default: () => (key, fallback = "") => fallback || key,
  useSiteCopy: () => (key, fallback = "") => fallback || key,
  getPageCopySync: () => (key, fallback = "") => fallback || key,
}));
vi.mock("../hooks/useSeo.js", () => ({ useSeo: vi.fn() }));
vi.mock("../hooks/useCmsSchedule.js", () => ({ default: () => state.schedule }));

const photo = (id, caption = null) => ({
  id,
  url: `https://cms.example.test/media/${id}.jpg`,
  alt: `Målning ${id}`,
  caption,
  width: 1500,
  height: 2000,
  sizes: { medium: { url: `https://cms.example.test/media/${id}-900.webp`, width: 900, height: 1200 } },
});

const konstafton = {
  id: 9,
  slug: "konstafton-2026",
  title: "Konstafton 2026",
  category: "konst",
  startAt: "2026-10-31T17:00:00.000Z",
  endAt: "2026-10-31T21:00:00.000Z",
  description: "En kväll med konst.",
  artists: "Ann Wiklund, Lina Wiklund",
  location: "Ladan",
  status: "open",
  sessions: [],
  links: [],
  images: [],
  media: [photo(1, "Dansaren – Lina Wiklund"), photo(2), photo(3, "Havet – Ann Wiklund")],
};

function renderAt(path) {
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/evenemang/:slug" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EventDetailPage", () => {
  afterEach(() => {
    state.schedule = { events: [], coursePasses: [], settled: true };
  });

  it("shows the event by its address: facts, the first photo large and the rest with captions", () => {
    state.schedule = { events: [konstafton], coursePasses: [], settled: true };
    renderAt("/evenemang/konstafton-2026/");

    expect(screen.getByRole("heading", { level: 1, name: "Konstafton 2026" })).toBeInTheDocument();
    expect(screen.getByText("Ann Wiklund, Lina Wiklund")).toBeInTheDocument();
    expect(screen.getByText("event-page.past")).toBeInTheDocument();
    // The cover is the first photo, in its uncropped medium size, with its caption.
    expect(screen.getByAltText("Målning 1")).toHaveAttribute("src", konstafton.media[0].sizes.medium.url);
    expect(screen.getByText("Dansaren – Lina Wiklund")).toBeInTheDocument();
    // The grid holds the other two and counts all three.
    const grid = screen.getByRole("heading", { level: 2, name: /event-page.photos/ });
    expect(grid).toHaveTextContent("3");
    expect(screen.getByAltText("Målning 2")).toBeInTheDocument();
    expect(screen.getByText("Havet – Ann Wiklund")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "event-page.show-larger: Havet – Ann Wiklund" })).toBeInTheDocument();
  });

  it("waits for the live answer before calling an unknown address missing", () => {
    state.schedule = { events: [konstafton], coursePasses: [], settled: false };
    const { unmount } = renderAt("/evenemang/nytt-evenemang/");
    expect(screen.getByRole("status")).toHaveTextContent("event-page.loading");
    unmount();

    state.schedule = { events: [konstafton], coursePasses: [], settled: true };
    renderAt("/evenemang/nytt-evenemang/");
    expect(screen.getByRole("heading", { level: 1, name: "event-page.not-found" })).toBeInTheDocument();
  });
});
