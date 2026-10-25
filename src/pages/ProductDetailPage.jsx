import { useParams, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageSection } from "../components";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { ProductContext } from "../components/layout/ProductContext/ProductContext.jsx";
import { ProductRecommendations } from "../features/shop";
import { formatPrice } from "../services/stripeService";
import { useSiteCopy } from "../hooks/usePageCopy";
import { useSeo } from "../hooks/useSeo.js";
import { productSeoMeta } from "../config/seoMeta.js";
import "./ProductDetailPage.css";

function ProductDetailPage() {
  const siteCopy = useSiteCopy();
  const { productId } = useParams();
  const cartContext = useContext(CartContext);
  const productContext = useContext(ProductContext);
  const products = productContext?.products ?? [];
  const productsLoading = productContext?.loading ?? false;
  const loadProducts = productContext?.load;
  useEffect(() => {
    loadProducts?.();
  }, [loadProducts]);

  // The product comes straight from the list ProductContext loads. While that list is still
  // loading, a missing product means "not yet", never "not found", so a direct visit no longer
  // flashes "Produkten hittades inte" before the product appears.
  const product =
    products.find((item) => String(item.id) === String(productId)) ?? null;
  const loading = !product && productsLoading;
  // The chosen thumbnail belongs to one product; another product starts on its first image.
  const [imageChoice, setImageChoice] = useState({ productId, index: 0 });
  const activeImage = imageChoice.productId === productId ? imageChoice.index : 0;
  const setActiveImage = (index) => setImageChoice({ productId, index });
  useSeo(product ? productSeoMeta({ slug: product.id, title: product.name, description: product.description }) : {});

  // Loading state
  if (loading) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="product-loading" role="status">
            <Loader2 className="spinner" size={48} aria-hidden="true" />
            <p>{siteCopy("ui.loading-product")}</p>
          </div>
        </PageSection>
      </main>
    );
  }

  // Not found state
  if (!product) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="product-not-found">
            <h1>{siteCopy("cart.product-not-found")}</h1>
            <p>{siteCopy("cart.product-not-found-desc")}</p>
            <Link to="/butik/" className="btn btn--primary">
              {siteCopy("cart.back-to-shop")}
            </Link>
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

            {(product.longDescription || product.description) && (
              <div className="description">
                <p>{product.longDescription || product.description}</p>
              </div>
            )}

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
                className="btn btn--primary add-to-cart-btn"
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
            <span aria-hidden="true">← </span>
            {siteCopy("cart.back-to-shop")}
          </Link>
        </div>
      </PageSection>

      <ProductRecommendations products={products} currentProduct={product} />
    </main>
  );
}

export default ProductDetailPage;
