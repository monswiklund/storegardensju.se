import { useParams, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageSection } from "../components";
import { ProductContext } from "../components/layout/ProductContext/ProductContext.jsx";
import { ProductRecommendations } from "../features/shop";
import { getStripeProductById, formatPrice } from "../services/stripeService";
import "./ProductDetailPage.css";

/**
 * ProductDetailPage - Detaljsida för enskild produkt
 *
 * Hämtar produktdata från Stripe via backend API
 */

function ProductDetailPage() {
  const { productId } = useParams();
  const productContext = useContext(ProductContext);
  const products = productContext?.products ?? [];
  const productsLoading = productContext?.loading ?? false;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Hämta produkt från Stripe vid mount eller när productId ändras
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const contextProduct = products.find((item) => String(item.id) === String(productId));
        if (productId?.startsWith("cms-") && productsLoading && !contextProduct) return;
        const resolvedProduct = contextProduct || await getStripeProductById(productId);

        if (!resolvedProduct) {
          setError("Produkten hittades inte");
          setProduct(null);
        } else {
          setProduct(resolvedProduct);
          setActiveImage(0);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Kunde inte ladda produkten. Försök igen senare.");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, products, productsLoading]);

  // Loading state
  if (loading) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="product-loading">
            <Loader2 className="spinner" size={48} />
            <p>Laddar produkt...</p>
          </div>
        </PageSection>
      </main>
    );
  }

  // Error/Not found state
  if (error || !product) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="product-not-found">
            <h1>Produkten hittades inte</h1>
            <p>{error || "Den produkt du söker finns inte längre."}</p>
            <Link to="/butik/">Tillbaka till butiken</Link>
          </div>
        </PageSection>
      </main>
    );
  }

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        {/* Breadcrumb navigation */}
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link to="/">Hem</Link>
          <span> / </span>
          <Link to="/butik/">Butik</Link>
          <span> / </span>
          <span aria-current="page">{product?.name || "Produkt"}</span>
        </nav>

        <div className="product-detail">
          {/* Bildgalleri */}
          <div className="product-images">
            {product?.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="main-image" />
            ) : (
              <div className="main-image product-image-placeholder">Ingen produktbild</div>
            )}
            {product?.images?.length > 1 && (
              <div className="product-image-thumbnails" aria-label="Produktbilder">
                {product.images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={index === activeImage ? "is-active" : ""}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Visa produktbild ${index + 1}`}
                    aria-pressed={index === activeImage}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Produktinfo */}
          <div className="product-info">
            <h1>{product?.name}</h1>

            <p className="artist">Av {product?.artist}</p>

            <p className="price">{product && formatPrice(product.price)}</p>

            <div className="description">
              {/* TODO(human): Visa product.longDescription här
               *
               * Tips: longDescription är längre än description
               * och ger mer detaljer om produkten
               */}
              <p>{product?.longDescription}</p>
            </div>

            {/* Lagerstatus */}
            <div className="stock-status">
              {/* TODO(human): Visa lagerstatus
               *
               * Tips: Conditional rendering baserat på product.stock
               * - Om stock > 0: "I lager ({stock} st)"
               * - Om stock === 0: "Slutsåld"
               *
               * Använd olika CSS-klasser för olika status
               */}
              {product && product.active && product.stock > 0 ? (
                <span className="in-stock">I lager ({product.stock} st)</span>
              ) : (
                <span className="out-of-stock">Slutsåld</span>
              )}
            </div>

            {/* Köp-sektion */}
            <div className="purchase-section">
              {/* TODO(human): Lägg till kvantitet-väljare
               *
               * Tips:
               * - Input type="number" med min="1" max={product.stock}
               * - Använd useState för att hålla vald kvantitet
               * - Default value: 1
               */}
              <button
                type="button"
                className="add-to-cart-btn"
                disabled={product && !product.active}
              >
                {product && product.active ? "Lägg i varukorg" : "Slutsåld"}
              </button>
            </div>

            {/* Metadata */}
            <div className="product-metadata">
              <p>
                <strong>Kategori:</strong> {product?.category}
              </p>
              <p>
                <strong>Produkt-ID:</strong> {product?.id}
              </p>
            </div>
          </div>
        </div>

        {/* Tillbaka-knapp */}
        <div className="back-to-shop">
          <Link to="/butik/" className="back-link">
            ← Tillbaka till butiken
          </Link>
        </div>
      </PageSection>

      <ProductRecommendations products={products} currentProduct={product} />
    </main>
  );
}

export default ProductDetailPage;
