import { fireEvent, render, screen } from "@testing-library/react";
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

  it("turns an empty shop into a next step: ask via the form, follow on Instagram, explore the farm", () => {
    const onExpand = vi.fn();
    window.addEventListener("expand-contact-form", onExpand);
    const { container } = render(
      <MemoryRouter>
        <ProductContext.Provider
          value={{ products: [], loading: false, error: null, categories: [], refetch: vi.fn() }}
        >
          <CartContext.Provider value={{ addItem: vi.fn(), isInCart: () => false }}>
            <ButikPage />
          </CartContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    );

    const empty = container.querySelector(".products-empty");
    expect(empty.querySelector("h2")).toBeInTheDocument();
    expect(empty.querySelector('a[href="https://www.instagram.com/storegarden7/"]')).toBeInTheDocument();

    fireEvent.click(empty.querySelector("button"));
    expect(onExpand).toHaveBeenCalledTimes(1);
    window.removeEventListener("expand-contact-form", onExpand);

    expect(container.querySelector(".explore-more a")).toHaveAttribute("href", "/kurser/konst/");
  });
});
