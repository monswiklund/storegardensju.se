import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ButikPage from "./ButikPage.jsx";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { ProductContext } from "../components/layout/ProductContext/ProductContext.jsx";

const product = {
  id: "keramik-vas-001",
  name: "Handgjord Keramikvas",
  description: "En blå vas.",
  images: ["/images/products/vas.webp"],
  category: "keramik",
  stock: 2,
  active: true,
  price: 150,
};

describe("ButikPage", () => {
  it("links product image and name to the product detail route", () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider
          value={{
            products: [product],
            loading: false,
            error: null,
            categories: ["alla", "keramik"],
            refetch: vi.fn(),
          }}
        >
          <CartContext.Provider
            value={{
              addItem: vi.fn(),
              isInCart: () => false,
            }}
          >
            <ButikPage />
          </CartContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link", { name: "Handgjord Keramikvas" });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", "/butik/keramik-vas-001/");
  });
});
