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
import { fetchShopProducts } from "../../../services/cmsService";

export const ProductContext = createContext();

/**
 * ProductProvider - Global provider för produktdata
 *
 * Laddar produkter från CMS och Stripe vid app-start så de är redo
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

      const [stripeProducts, cmsProducts] = await Promise.all([
        getStripeProducts().catch(() => []),
        fetchShopProducts().catch(() => []),
      ]);

      const formattedCmsProducts = (cmsProducts || []).map((doc) => ({
        id: `cms-${doc.id}`,
        name: doc.title,
        description: doc.description || "",
        price: (doc.price || 0) * 100,
        category: doc.category || "keramik",
        images: [doc.imageUrl || "/images/butik/butik.webp"],
        active: doc.status !== "sold_out",
        stock: doc.status === "in_stock" ? 10 : 1,
        metadata: {
          status: doc.status,
          dimensions: doc.dimensions,
        },
      }));

      const allProducts = stripeProducts.length > 0 ? stripeProducts : formattedCmsProducts;
      setProducts(allProducts);
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
      const [stripeProducts, cmsProducts] = await Promise.all([
        getStripeProducts().catch(() => []),
        fetchShopProducts().catch(() => []),
      ]);

      const formattedCmsProducts = (cmsProducts || []).map((doc) => ({
        id: `cms-${doc.id}`,
        name: doc.title,
        description: doc.description || "",
        price: (doc.price || 0) * 100,
        category: doc.category || "keramik",
        images: [doc.imageUrl || "/images/butik/butik.webp"],
        active: doc.status !== "sold_out",
        stock: doc.status === "in_stock" ? 10 : 1,
        metadata: {
          status: doc.status,
          dimensions: doc.dimensions,
        },
      }));

      const allProducts = stripeProducts.length > 0 ? stripeProducts : formattedCmsProducts;
      setProducts(allProducts);
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
