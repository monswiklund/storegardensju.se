import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationBell from "./NotificationBell.jsx";

vi.mock("../../../services/notificationsService.js", () => ({
  fetchPublicNotifications: vi.fn().mockResolvedValue([
    {
      id: "yoga-pa-loftet-2026-07-30",
      title: "Lina håller yoga på loftet",
      message: "Torsdag 30 juli kl. 18:00",
      href: "/kurser/yoga/#yoga-30-juli",
    },
  ]),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows upcoming activities and persists their read state", async () => {
    const { unmount } = render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Visa aktuellt, 1 oläst" }));

    const activity = screen.getByRole("link", {
      name: /Lina håller yoga på loftet/i,
    });
    expect(activity).toHaveAttribute("href", "/kurser/yoga/#yoga-30-juli");

    fireEvent.click(
      screen.getByRole("button", { name: "Markera lästa" }),
    );
    expect(
      screen.getByRole("button", { name: "Visa aktuellt" }),
    ).toBeInTheDocument();

    unmount();
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: "Visa aktuellt" }),
    ).toBeInTheDocument();
  });

  it("closes the panel with Escape", async () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /Visa aktuellt, 1 oläst/ }));
    expect(screen.getByRole("region", { name: "Aktuellt" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("region", { name: "Aktuellt" }),
    ).not.toBeInTheDocument();
  });
});
