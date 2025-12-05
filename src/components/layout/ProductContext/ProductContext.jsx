import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getStripeProducts,
  getCategories,
} from "../../../services/stripeService";

export const ProductContext = createContext();

/**
 * ProductProvider - Global provider för produktdata
 *
 * Laddar produkter från Stripe vid app-start så de är redo
 * när användaren navigerar till butiken.
 */
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hämta produkter vid mount (app start)
  const fetchProducts = useCallback(async () => {
    // Skippa om vi redan har produkter
    if (products.length > 0) return;

    try {
      setLoading(true);
      setError(null);
      const stripeProducts = await getStripeProducts();
      setProducts(stripeProducts);
    } catch (err) {
      console.error("Failed to prefetch products:", err);
      setError("Kunde inte ladda produkter. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  }, [products.length]);

  // Starta prefetch vid mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Retry-funktion för manuell omladdning
  const refetch = useCallback(async () => {
    setProducts([]); // Rensa för att tillåta ny fetch
    try {
      setLoading(true);
      setError(null);
      const stripeProducts = await getStripeProducts();
      setProducts(stripeProducts);
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
      refetch,
    }),
    [products, loading, error, categories, refetch]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}
