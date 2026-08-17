import { useParams, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageSection } from "../components";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { ProductContext } from "../components/layout/ProductContext/ProductContext.jsx";
import { ProductRecommendations } from "../features/shop";
import { getStripeProductById, formatPrice } from "../services/stripeService";
import { useSiteCopy } from "../hooks/usePageCopy";
import "./ProductDetailPage.css";

function ProductDetailPage() {
  const siteCopy = useSiteCopy();
  const { productId } = useParams();
  const cartContext = useContext(CartContext);
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
          setError(siteCopy("cart.product-not-found") || "error");
          setProduct(null);
        } else {
          setProduct(resolvedProduct);
          setActiveImage(0);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(siteCopy("ui.error"));
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, products, productsLoading, siteCopy]);

  // Loading state
  if (loading) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="product-loading">
            <Loader2 className="spinner" size={48} />
            <p>{siteCopy("ui.loading-product")}</p>
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
            <h1>{siteCopy("cart.product-not-found")}</h1>
            <p>{siteCopy("cart.product-not-found-desc")}</p>
            <Link to="/butik/">{siteCopy("cart.back-to-shop")}</Link>
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
          <Link to="/">{siteCopy("nav.home")}</Link>
          <span> / </span>
          <Link to="/butik/">{siteCopy("nav.shop")}</Link>
          <span> / </span>
          <span aria-current="page">{product?.name || ""}</span>
        </nav>

        <div className="product-detail">
          {/* Bildgalleri */}
          <div className="product-images">
            {product?.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="main-image" />
            ) : (
              <div className="main-image product-image-placeholder">{siteCopy("ui.image-placeholder")}</div>
            )}
            {product?.images?.length > 1 && (
              <div className="product-image-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={index === activeImage ? "is-active" : ""}
                    onClick={() => setActiveImage(index)}
                    aria-label={`${siteCopy("cart.view-image")} ${index + 1}`}
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

            {product?.artist && <p className="artist">{product.artist}</p>}

            <p className="price">{product && formatPrice(product.price)}</p>

            <div className="description">
              <p>{product?.longDescription}</p>
            </div>

            {/* Lagerstatus */}
            <div className="stock-status">
              {product && product.active && product.stock > 0 ? (
                <span className="in-stock">{product.stock} {siteCopy("cart.in-stock")}</span>
              ) : (
                <span className="out-of-stock">{siteCopy("cart.sold-out")}</span>
              )}
            </div>

            {/* Köp-sektion */}
            <div className="purchase-section">
              <button
                type="button"
                className="add-to-cart-btn"
                disabled={product && (!product.active || product.stock === 0)}
                onClick={() => {
                  if (product && product.active) {
                    cartContext?.addItem?.(product, 1);
                  }
                }}
              >
                {product && product.active && product.stock > 0 ? siteCopy("cart.add-to-cart-btn") : siteCopy("cart.sold-out")}
              </button>
            </div>

            {/* Metadata */}
            <div className="product-metadata">
              {product?.category && (
                <p>
                  <strong>{siteCopy("cart.product-category-label")}</strong> {product.category}
                </p>
              )}
              {product?.id && (
                <p>
                  <strong>{siteCopy("cart.product-id-label")}</strong> {product.id}
                </p>
              )}
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
