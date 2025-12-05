import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Loader2, ArrowRight } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { ProductContext } from "../components/layout/ProductContext/ProductContext.jsx";
import { PageSection } from "../components";
import { formatPrice } from "../services/stripeService";
import "./ButikPage.css";

/**
 * ButikPage - Huvudsida för produktkatalog
 *
 * Mål: Lära dig React hooks (useState) och list rendering
 *
 * Koncept som övas:
 * - useState för filter-state
 * - useContext för cart management och produkter
 * - Array.map() för att rendera produkter
 * - Conditional rendering
 * - Event handlers (onClick)
 */

function ButikPage() {
  // Hämta produkter från global ProductContext (prefetchade vid app start)
  const { products, loading, error, categories, refetch } =
    useContext(ProductContext);

  // State för aktiv kategori-filter
  const [activeCategory, setActiveCategory] = useState("alla");
  // State för att visa feedback när produkt läggs till
  const [addedToCart, setAddedToCart] = useState(null);

  // Hämta addItem och isInCart från CartContext
  const { addItem, isInCart } = useContext(CartContext);

  const filteredProducts =
    activeCategory === "alla"
      ? products
      : products.filter((product) => product.category === activeCategory);

  // Dynamisk grid-klass baserat på antal produkter
  const getGridClass = (count) => {
    if (count === 1) return "products-grid products-grid-1";
    if (count === 2) return "products-grid products-grid-2";
    if (count === 3) return "products-grid products-grid-3";
    if (count === 4) return "products-grid products-grid-4";
    return "products-grid"; // 5+ produkter - standard grid
  };

  const handleAddToCart = (product) => {
    addItem(product);
    setAddedToCart(product.id);
    // Ta bort feedback efter 2 sekunder
    setTimeout(() => setAddedToCart(null), 2000);
  };

  return (
    <main role="main" id="main-content">
      <PageSection background="white" spacing="default">
        {/* Header */}
        <div className="butik-header">
          <h1>Butik</h1>
          <p>Handgjord konst och keramik från lokala konstnärer</p>
        </div>

        {/* Kategorifilter - visa bara om det finns produkter */}
        {!loading && products.length > 0 && categories.length > 1 && (
          <div className="category-filters">
            {categories.map((category) => {
              const label =
                category.charAt(0).toUpperCase() + category.slice(1);
              return (
                <button
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="products-loading">
            <Loader2 className="spinner" size={48} />
            <p>Laddar produkter...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="products-error">
            <p>{error}</p>
            <button onClick={refetch}>Försök igen</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="products-empty">
            <p>Inga produkter tillgängliga just nu.</p>
            <p>Kom tillbaka snart!</p>
          </div>
        )}

        {/* Produktlista med dynamisk grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className={getGridClass(filteredProducts.length)}>
            {filteredProducts.map((product) => {
              const alreadyInCart = isInCart(product.id);
              const justAdded = addedToCart === product.id;
              const stock = product.stock || 1; // Default 1 för unika produkter

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-card-image">
                    <img src={product.images[0]} alt={product.name} />
                    <div className="product-badges">
                      <span className="product-badge">{product.category}</span>
                      {stock === 1 && (
                        <span className="product-badge">Unikt exemplar</span>
                      )}
                    </div>
                  </div>
                  <div className="product-card-content">
                    <h3>{product.name}</h3>
                    <p className="description">{product.description}</p>
                    <div className="price-stock">
                      <p className="price">{formatPrice(product.price)}</p>
                      {stock > 1 && (
                        <span className="stock-badge">{stock} i lager</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => !alreadyInCart && handleAddToCart(product)}
                      className={
                        justAdded ? "added" : alreadyInCart ? "in-cart" : ""
                      }
                      disabled={alreadyInCart && !justAdded}
                    >
                      {justAdded ? (
                        <>
                          <Check size={18} /> Tillagd!
                        </>
                      ) : alreadyInCart ? (
                        <>
                          <Check size={18} /> I varukorgen
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} /> Lägg i varukorg
                        </>
                      )}
                    </button>
                    {alreadyInCart && !justAdded && (
                      <Link to="/varukorg" className="btn-go-to-cart">
                        Till varukorgen <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PageSection>
    </main>
  );
}

export default ButikPage;
