import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import CartDrawer from "./CartDrawer.jsx";
import { CartContext } from "../CartContext/CartContext.jsx";

const vase = { id: "vas-1", name: "Blå vas", price: 450, quantity: 1, stock: 1, images: [] };

function Harness({ removeItem = vi.fn() }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <MemoryRouter>
      <button type="button" onClick={() => setIsCartOpen(true)}>
        Öppna korgen
      </button>
      <CartContext.Provider
        value={{
          cart: [vase],
          removeItem,
          updateQuantity: vi.fn(),
          getTotal: () => 450,
          isCartOpen,
          closeCart: () => setIsCartOpen(false),
        }}
      >
        <CartDrawer />
      </CartContext.Provider>
    </MemoryRouter>
  );
}

const drawer = (container) => container.querySelector(".cart-drawer");

describe("CartDrawer", () => {
  it("is inert while closed, so nothing in it can be tabbed to", () => {
    const { container } = render(<Harness />);
    expect(drawer(container)).toHaveAttribute("inert");
    expect(drawer(container)).not.toHaveClass("is-open");
  });

  it("opens as a labelled modal dialog, takes focus, traps Tab and gives focus back on Escape", () => {
    const { container } = render(<Harness />);
    const opener = screen.getByRole("button", { name: "Öppna korgen" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = drawer(container);
    expect(dialog).not.toHaveAttribute("inert");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "cart-drawer-title");
    expect(dialog.querySelector("#cart-drawer-title")).toBeInTheDocument();
    expect(document.activeElement).toBe(dialog);

    const focusable = dialog.querySelectorAll("button");
    const last = focusable[focusable.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(focusable[0]);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(dialog).toHaveAttribute("inert");
    expect(document.activeElement).toBe(opener);
  });

  it("removes just the one item its bin belongs to", () => {
    const removeItem = vi.fn();
    const { container } = render(<Harness removeItem={removeItem} />);
    fireEvent.click(screen.getByRole("button", { name: "Öppna korgen" }));

    fireEvent.click(drawer(container).querySelector(".remove-item-btn"));
    expect(removeItem).toHaveBeenCalledWith("vas-1");
    expect(drawer(container).querySelector(".remove-item-btn").getAttribute("aria-label")).toContain(
      "Blå vas"
    );
  });
});
