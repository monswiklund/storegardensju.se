import { act, render } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";

const fetchShopProducts = vi.fn(async () => []);
vi.mock("../../../services/cmsService", () => ({ fetchShopProducts }));

const { ProductContext, ProductProvider, toShopProduct } = await import("./ProductContext.jsx");

describe("ProductProvider", () => {
  it("fetches products only once a page asks for them", async () => {
    let context;
    const Probe = () => {
      context = useContext(ProductContext);
      return null;
    };
    render(
      <ProductProvider>
        <Probe />
      </ProductProvider>,
    );
    expect(fetchShopProducts).not.toHaveBeenCalled();

    await act(async () => {
      await context.load();
      await context.load();
    });
    expect(fetchShopProducts).toHaveBeenCalledTimes(1);
  });
});

describe("toShopProduct", () => {
  const doc = { id: 7, slug: "kopp-havsbla", title: "Kopp", price: 280, status: "in_stock", stripePriceId: "price_1", images: [] };

  it("keeps the CMS price in kronor and the Stripe price checkout charges", () => {
    expect(toShopProduct(doc)).toMatchObject({ id: "kopp-havsbla", price: 280, priceId: "price_1", active: true, stock: 1 });
  });

  it("cannot be bought when sold or without a Stripe price", () => {
    expect(toShopProduct({ ...doc, status: "sold_out" }).active).toBe(false);
    expect(toShopProduct({ ...doc, stripePriceId: null }).active).toBe(false);
  });

  it("lets several buyers order a made-to-order product", () => {
    expect(toShopProduct({ ...doc, status: "made_to_order" }).stock).toBeGreaterThan(1);
  });
});
