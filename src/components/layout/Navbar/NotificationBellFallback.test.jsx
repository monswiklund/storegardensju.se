import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import NotificationBell from "./NotificationBell.jsx";
import { fetchPublicNotifications } from "../../../services/notificationsService.js";

vi.mock("../../../data/cmsContent.generated.js", async () => ({
  default: (await import("../../../test/cmsScheduleFixture.js")).SNAPSHOT,
}));
vi.mock("../../../services/notificationsService.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchPublicNotifications: vi.fn(),
}));

const openBell = async () => {
  render(<MemoryRouter><NotificationBell /></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: /Aviseringar/ }));
};

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe("NotificationBell over time", () => {
  it("shows the exported passes still ahead when the CMS cannot be read", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-08-15T12:00:00+02:00"));
    fetchPublicNotifications.mockRejectedValue(new Error("offline"));

    await openBell();

    // 11-13 August are over; 18-20 August and the September course are ahead.
    expect(await screen.findAllByRole("link", { name: /Lina håller yoga på loftet/ })).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Ann håller akvarell/ })).toBeInTheDocument();
  });

  it("shows nothing from the fallback once the last pass is over", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-01-01T00:00:00+01:00"));
    fetchPublicNotifications.mockRejectedValue(new Error("offline"));

    await openBell();

    expect(await screen.findByText(/./, { selector: ".notification-empty" })).toBeInTheDocument();
  });

  it("hides a notice outside its window and shows nothing extra for an empty answer", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-24T12:00:00+02:00"));
    fetchPublicNotifications.mockResolvedValue([
      { id: 1, title: "Höstloppis", message: "Lördag", href: "/event", endsAt: "2026-10-01T00:00:00.000Z" },
      { id: 2, title: "Julmarknad", message: "December", href: "/event", startsAt: "2026-10-01T00:00:00.000Z" },
    ]);

    await openBell();

    expect(await screen.findByRole("link", { name: /Julmarknad/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Höstloppis/ })).not.toBeInTheDocument();
    // A successful answer is the list: the pass fallback is not mixed in.
    expect(screen.queryByRole("link", { name: /håller/ })).not.toBeInTheDocument();
  });
});
