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
          isCollapsed={false}
          onToggleCollapsed={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("button", { current: "page" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Galleri" })).toHaveAttribute(
      "aria-current",
      "page"
    );
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

  it("V24 toggles the sidebar and closes the mobile drawer with Escape", () => {
    const onToggleCollapsed = vi.fn();
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <AdminSidebar
          adminView="overview"
          onViewChange={vi.fn()}
          isOpen
          onClose={onClose}
          isCollapsed
          onToggleCollapsed={onToggleCollapsed}
        />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Expandera sidomenyn" })
    );
    expect(onToggleCollapsed).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
