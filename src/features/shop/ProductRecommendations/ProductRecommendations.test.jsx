import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ProductRecommendations, {
  getRelatedProducts,
} from "./ProductRecommendations.jsx";

const currentProduct = {
  id: "current",
  category: "keramik",
};

const products = [
  { id: "current", category: "keramik", active: true, stock: 1 },
  {
    id: "same-category",
    name: "Blå skål",
    category: "keramik",
    active: true,
    stock: 2,
    price: 250,
    images: ["/images/products/bla-skal.webp"],
  },
  {
    id: "sold-out",
    name: "Slutsåld vas",
    category: "keramik",
    active: false,
    stock: 0,
    price: 300,
    images: ["/images/products/slutsald.webp"],
  },
  {
    id: "other-category",
    name: "Liten tavla",
    category: "konst",
    active: true,
    stock: 1,
    price: 500,
    images: ["/images/products/tavla.webp"],
  },
];

describe("ProductRecommendations", () => {
  it("excludes the current and unavailable products, preferring the same category", () => {
    expect(getRelatedProducts(products, currentProduct).map((item) => item.id)).toEqual([
      "same-category",
      "other-category",
    ]);
  });

  it("falls back to the shop CTA when no related product exists", () => {
    render(
      <MemoryRouter>
        <ProductRecommendations products={[]} currentProduct={currentProduct} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Fortsätt upptäcka butiken" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Se hela butiken/ })).toHaveAttribute(
      "href",
      "/butik/"
    );
  });
});
