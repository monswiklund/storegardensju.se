import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import CheckoutPage from "./CheckoutPage.jsx";
import { CartContext } from "../../components/layout/CartContext/CartContext.jsx";

const renderWithSubtotal = (subtotal) => {
  const cart = [{ id: "vas", name: "Vas", price: subtotal, quantity: 1, images: [] }];
  const { container } = render(
    <MemoryRouter>
      <CartContext.Provider value={{ cart, getTotal: () => subtotal }}>
        <CheckoutPage />
      </CartContext.Provider>
    </MemoryRouter>
  );
  // Amounts in on-screen order: Delsumma, Frakt, Totalt.
  return [...container.querySelectorAll(".order-total-row span:last-child")].map(
    (cell) => cell.textContent
  );
};

describe("CheckoutPage totals", () => {
  it("shows the 49 kr shipping as its own row, so the rows add up to Totalt", () => {
    expect(renderWithSubtotal(450)).toEqual(["450 kr", "49 kr", "499 kr"]);
  });

  it("charges no shipping from 500 kr", () => {
    const [subtotal, shipping, total] = renderWithSubtotal(500);
    expect(subtotal).toBe("500 kr");
    expect(shipping).not.toMatch(/\d/);
    expect(total).toBe("500 kr");
  });
});
