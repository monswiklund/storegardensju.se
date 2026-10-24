import { act, render } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";

const getStripeProducts = vi.fn(async () => []);
const fetchShopProducts = vi.fn(async () => []);
vi.mock("../../../services/stripeService", () => ({ getStripeProducts, getCategories: () => [] }));
vi.mock("../../../services/cmsService", () => ({ fetchShopProducts }));

const { ProductContext, ProductProvider } = await import("./ProductContext.jsx");

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
    expect(getStripeProducts).not.toHaveBeenCalled();

    await act(async () => {
      await context.load();
      await context.load();
    });
    expect(getStripeProducts).toHaveBeenCalledTimes(1);
    expect(fetchShopProducts).toHaveBeenCalledTimes(1);
  });
});
