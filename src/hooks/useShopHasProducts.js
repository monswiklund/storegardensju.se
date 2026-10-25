import { useEffect, useState } from "react";
import CMS_CONTENT from "../data/cmsContent.generated.js";
import { fetchShopProducts } from "../services/cmsService.js";

const builtProductCount = CMS_CONTENT?.shopProducts?.length ?? 0;

/**
 * Whether the shop has anything to show, so the menus can hide an empty Butik.
 * Starts from the products baked into this build and turns true when the live CMS lists any.
 * A failed fetch also yields [], so live data can only add the link, never remove a built one.
 */
export default function useShopHasProducts() {
  const [hasProducts, setHasProducts] = useState(builtProductCount > 0);

  useEffect(() => {
    let cancelled = false;
    fetchShopProducts().then((products) => {
      if (!cancelled && products.length > 0) setHasProducts(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return hasProducts;
}
