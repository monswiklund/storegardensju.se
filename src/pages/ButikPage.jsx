import { useState, useContext } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../components";
import { products, getCategories, formatPrice } from "../data/products";
import "./ButikPage.css";

/**
 * ButikPage - Huvudsida för produktkatalog
 *
 * Mål: Lära dig React hooks (useState) och list rendering
 *
 * Koncept som övas:
 * - useState för filter-state
 * - useContext för cart management
 * - Array.map() för att rendera produkter
 * - Conditional rendering
 * - Event handlers (onClick)
 */

function ButikPage() {
  // State för aktiv kategori-filter
  const [activeCategory, setActiveCategory] = useState("alla");
  // State för att visa feedback när produkt läggs till
  const [addedToCart, setAddedToCart] = useState(null);

  // Hämta addItem från CartContext
  const { addItem } = useContext(CartContext);

  // Hämta alla kategorier från produktdata
  const categories = getCategories(); // ["alla", "keramik", "konst"]

  const filteredProducts =
    activeCategory === "alla"
      ? products
      : products.filter((product) => product.category === activeCategory);

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

        <div className="category-filters">
          {categories.map((category) => {
            const label = category.charAt(0).toUpperCase() + category.slice(1);
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

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card-image">
                <img src={product.images[0]} alt={product.name} />
                <span className="product-category">{product.category}</span>
              </div>
              <div className="product-card-content">
                <h3>{product.name}</h3>
                <p className="description">{product.description}</p>
                <p className="price">{formatPrice(product.price)}</p>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className={addedToCart === product.id ? "added" : ""}
                >
                  {addedToCart === product.id ? (
                    <>
                      <Check size={18} /> Tillagd!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Lägg i varukorg
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </PageSection>
    </main>
  );
}

export default ButikPage;
