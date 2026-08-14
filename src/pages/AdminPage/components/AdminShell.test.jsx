import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { AdminDrawer } from "./ui/AdminUI";

describe("admin shell", () => {
  it("V14 exposes one active navigation destination", () => {
    render(
      <MemoryRouter>
        <AdminSidebar
          adminView="gallery"
          onViewChange={vi.fn()}
          isOpen
          onClose={vi.fn()}
          isExpanded
          onExpandedChange={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("button", { current: "page" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Galleri" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("img", { name: "Storegården 7" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Redigera hemsidans texter" }),
    ).toHaveAttribute("href", "http://localhost:3002/admin");
    expect(screen.queryByText("S7")).not.toBeInTheDocument();
  });

  it("V15 has no duplicate global refresh action", () => {
    render(
      <MemoryRouter>
        <AdminHeader
          adminView="gallery"
          isPreview={false}
          onSwitchAccount={vi.fn()}
          onToggleSidebar={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole("button", { name: /uppdatera/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /visa webbplatsen/i })).toBeInTheDocument();
  });

  it("V18 closes drawers with Escape", () => {
    const onClose = vi.fn();
    render(
      <AdminDrawer open title="Inställningar" onClose={onClose}>
        <p>Innehåll</p>
      </AdminDrawer>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks page scrolling while keeping drawer scrolling native", () => {
    const stop = vi.fn();
    const start = vi.fn();
    window.storegardenLenis = { stop, start };

    const { unmount } = render(
      <AdminDrawer open title="Inställningar" onClose={vi.fn()}>
        <p>Innehåll</p>
      </AdminDrawer>
    );

    expect(document.documentElement).toHaveClass("admin-drawer-open");
    expect(document.body).toHaveClass("admin-drawer-open");
    expect(screen.getByRole("dialog")).toHaveAttribute("data-lenis-prevent");
    expect(stop).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.documentElement).not.toHaveClass("admin-drawer-open");
    expect(document.body).not.toHaveClass("admin-drawer-open");
    expect(start).toHaveBeenCalledTimes(1);
    delete window.storegardenLenis;
  });

  it("V24 auto-expands the sidebar and closes the mobile drawer with Escape", () => {
    const onExpandedChange = vi.fn();
    const onClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <AdminSidebar
          adminView="overview"
          onViewChange={vi.fn()}
          isOpen
          onClose={onClose}
          isExpanded={false}
          onExpandedChange={onExpandedChange}
        />
      </MemoryRouter>
    );

    const sidebar = container.querySelector(".admin-sidebar");
    fireEvent.pointerEnter(sidebar);
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    fireEvent.pointerLeave(sidebar);
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);

    fireEvent.focus(screen.getByRole("button", { name: "Översikt" }));
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
