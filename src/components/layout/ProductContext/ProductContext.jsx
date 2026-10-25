import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { getCategories } from "../../../services/stripeService";
import { fetchShopProducts } from "../../../services/cmsService";
import { normalizeMediaList } from "../../../services/mediaService.js";

export const ProductContext = createContext();

/**
 * A product as the shop pages use it. The CMS is the only source: publishing a
 * product there creates its Stripe price, which checkout charges. Price is in
 * kronor, like formatPrice expects.
 */
export function toShopProduct(doc) {
  return {
    id: doc.slug || `cms-${doc.id}`,
    name: doc.title,
    description: doc.description || "",
    price: doc.price || 0,
    priceId: doc.stripePriceId || "",
    category: doc.category || "keramik",
    images: normalizeMediaList(doc.images, "card").map((image) => image.src),
    // Without a Stripe price there is nothing checkout could charge.
    active: doc.status !== "sold_out" && Boolean(doc.stripePriceId),
    // One unique piece, unless every buyer gets their own.
    stock: doc.status === "made_to_order" ? 10 : 1,
    metadata: {
      status: doc.status,
      dimensions: doc.dimensions,
    },
  };
}

const loadShopProducts = async () =>
  (await fetchShopProducts().catch(() => [])).map(toShopProduct);

/**
 * ProductProvider - Global provider för produktdata
 *
 * Laddar produkterna från CMS:et första gången butiken eller en produktsida
 * behöver dem (load), inte på varje sidvisning.
 */
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requested = useRef(false);

  const fetchProducts = useCallback(async () => {
    // One request per visit; refetch() is the explicit reload.
    if (requested.current) return;
    requested.current = true;

    try {
      setLoading(true);
      setError(null);

      setProducts(await loadShopProducts());
    } catch (err) {
      console.error("Failed to prefetch products:", err);
      setError("Kunde inte ladda produkter. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Retry-funktion för manuell omladdning
  const refetch = useCallback(async () => {
    setProducts([]); // Rensa för att tillåta ny fetch
    try {
      setLoading(true);
      setError(null);
      setProducts(await loadShopProducts());
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Kunde inte ladda produkter. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized categories
  const categories = useMemo(() => getCategories(products), [products]);

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      categories,
      load: fetchProducts,
      refetch,
    }),
    [products, loading, error, categories, fetchProducts, refetch]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}
