import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Check,
  Loader2,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { ProductContext } from "../components/layout/ProductContext/ProductContext.jsx";
import { ExploreMoreSection, PageSection } from "../components";
import { formatPrice } from "../services/stripeService";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import "./ButikPage.css";

function ButikPage() {
  useSeo(seoMeta.butik);
  const copy = usePageCopy("shop");
  const siteCopy = useSiteCopy();
  // Hämta produkter från global ProductContext (prefetchade vid app start)
  const { products, loading, error, categories, refetch } =
    useContext(ProductContext);

  // State för aktiv kategori-filter
  const [activeCategory, setActiveCategory] = useState("alla");
  // State för att visa feedback när produkt läggs till
  const [addedToCart, setAddedToCart] = useState(null);
  // State för valt antal per produkt (för produkter med stock > 1)
  const [quantities, setQuantities] = useState({});

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
    return "products-grid";
  };

  const handleAddToCart = (product, qty = 1) => {
    if (!product.active) return;
    addItem(product, qty);
    setAddedToCart(product.id);
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const handleQuantityChange = (productId, stock, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(stock, current + delta));
      return { ...prev, [productId]: newQty };
    });
  };

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        {/* Header */}
        <div className="butik-header" data-cms-hero data-cms-hero-content>
          <span className="section-eyebrow">
            {copy("hero.eyebrow")}
          </span>
          <div className="section-ornament" aria-hidden="true">
            <span className="section-ornament-line"></span>
            <ShoppingBag size={20} />
            <span className="section-ornament-line"></span>
          </div>
          <h1>{copy("hero.title")}</h1>
          <p>
            {copy("hero.lead")}
          </p>
        </div>

        {/* Kategorifilter - visa bara om det finns produkter */}
        {!loading && products.length > 0 && categories.length > 1 && (
          <div className="category-filters">
            {categories.map((category) => {
              const label =
                siteCopy(`cart.category-${category}`) ||
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
            <p>{siteCopy("ui.loading-products")}</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="products-error">
            <p>{error}</p>
            <button onClick={refetch}>{siteCopy("ui.retry")}</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="products-empty">
            <p>
              {copy("empty.title")}
            </p>
            <p>
              {copy("empty.body")}
            </p>
          </div>
        )}

        {/* Produktlista med dynamisk grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className={getGridClass(filteredProducts.length)}>
            {filteredProducts.map((product) => {
              const alreadyInCart = isInCart(product.id);
              const justAdded = addedToCart === product.id;
              const stock = product.stock ?? 1;
              const isSoldOut = !product.active || stock === 0;

              return (
                <article
                  className={`product-card ${isSoldOut ? "sold-out" : ""}`}
                  key={product.id}
                >
                  <Link
                    className="product-card-image-link"
                    to={`/butik/${product.id}/`}
                    aria-label={product.name}
                  >
                    <div className="product-card-image">
                      {product.images?.[0] ? <img
                        src={product.images[0]}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      /> : <div className="product-card-image-placeholder">{siteCopy("ui.image-placeholder")}</div>}
                      {/* Endast SÅLD badge visas på bilden */}
                      {isSoldOut && (
                        <div className="product-badges">
                          <span className="product-badge badge-sold-out">
                            {siteCopy("cart.sold-badge")}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="product-card-content">
                    <Link
                      className="product-card-title-link"
                      to={`/butik/${product.id}/`}
                    >
                      <h3>{product.name}</h3>
                    </Link>
                    <p className="description">{product.description}</p>

                    {/* Kategori och Unikt exemplar som text under beskrivning */}
                    <p className="product-meta">
                      {product.category}
                      {stock === 1 && !isSoldOut && ` · ${siteCopy("cart.unique-item")}`}
                    </p>

                    {/* Quantity selector med stock till vänster */}
                    {stock > 1 && !isSoldOut && !alreadyInCart && (
                      <div className="quantity-row">
                        <span className="stock-text">{stock} {siteCopy("cart.in-stock")}</span>
                        <div className="quantity-selector">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() =>
                              handleQuantityChange(product.id, stock, -1)
                            }
                            disabled={(quantities[product.id] || 1) <= 1}
                            aria-label={siteCopy("cart.decrease-qty")}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="qty-value">
                            {quantities[product.id] || 1}
                          </span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() =>
                              handleQuantityChange(product.id, stock, 1)
                            }
                            disabled={(quantities[product.id] || 1) >= stock}
                            aria-label={siteCopy("cart.increase-qty")}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pris och köp-knapp i samma rad */}
                    <div className="price-button-row">
                      <p className="price">{formatPrice(product.price)}</p>
                      <button
                        type="button"
                        onClick={() =>
                          !alreadyInCart &&
                          handleAddToCart(product, quantities[product.id] || 1)
                        }
                        className={`add-btn ${
                          justAdded ? "added" : alreadyInCart ? "in-cart" : ""
                        }`}
                        disabled={isSoldOut || (alreadyInCart && !justAdded)}
                      >
                        {isSoldOut ? (
                          <>{siteCopy("cart.sold-badge")}</>
                        ) : justAdded ? (
                          <>
                            <Check size={14} /> {siteCopy("cart.added")}
                          </>
                        ) : alreadyInCart ? (
                          <>
                            <Check size={14} /> {siteCopy("cart.in-cart")}
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} /> {siteCopy("cart.buy-btn")}
                          </>
                        )}
                      </button>
                    </div>
                    {alreadyInCart && !justAdded && (
                      <Link to="/varukorg" className="btn-go-to-cart">
                        {siteCopy("cart.drawer-title")} <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PageSection>

      <ExploreMoreSection
        id="shop-explore-more"
        eyebrow={copy("explore.eyebrow")}
        title={copy("explore.title")}
        intro={copy("explore.body")}
        background="green"
        items={[
          {
            to: "/event/",
            eyebrow: copy("explore.items.0.eyebrow"),
            title: copy("explore.items.0.title"),
            text: copy("explore.items.0.body"),
            featured: true,
          },
          {
            to: "/galleri/",
            eyebrow: copy("explore.items.1.eyebrow"),
            title: copy("explore.items.1.title"),
            text: copy("explore.items.1.body"),
          },
          {
            to: "/om-oss/",
            eyebrow: copy("explore.items.2.eyebrow"),
            title: copy("explore.items.2.title"),
            text: copy("explore.items.2.body"),
          },
        ]}
      />
    </main>
  );
}

export default ButikPage;
