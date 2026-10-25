import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ExploreMore } from "../../../components";
import { formatPrice } from "../../../services/stripeService";
import "./ProductRecommendations.css";

import usePageCopy from "../../../hooks/usePageCopy";

// Someone looking at ceramics is closest to the painting and ceramics course, so it leads.
export const SHOP_EXPLORE_IDS = ["kurser-konst", "brollop", "event", "gruppdagar"];

function isAvailable(product) {
  return Boolean(product?.active) && (product.stock ?? 0) > 0;
}

export function getRelatedProducts(products = [], currentProduct) {
  const availableProducts = products.filter(
    (product) => product.id !== currentProduct?.id && isAvailable(product)
  );

  const sameCategory = currentProduct?.category
    ? availableProducts.filter(
        (product) => product.category === currentProduct.category
      )
    : [];

  const otherCategories = availableProducts.filter(
    (product) => !sameCategory.includes(product)
  );

  return [...sameCategory, ...otherCategories].slice(0, 3);
}

function ProductRecommendations({ products, currentProduct }) {
  const copy = usePageCopy("shop");
  const relatedProducts = getRelatedProducts(products, currentProduct);

  if (relatedProducts.length === 0) {
    // Nothing else to recommend: the page already links back to the shop, so offer the farm.
    return <ExploreMore ids={SHOP_EXPLORE_IDS} background="alt" />;
  }

  return (
    <section
      className="product-recommendations"
      aria-labelledby="product-recommendations-title"
    >
      <div className="product-recommendations__inner">
        <div className="product-recommendations__heading">
          <span>{copy("recommendations.eyebrow")}</span>
          <h2 id="product-recommendations-title">{copy("recommendations.title")}</h2>
          <p>{copy("recommendations.body")}</p>
        </div>

        <div className="product-recommendations__grid">
          {relatedProducts.map((product) => (
            <Link
              className="product-recommendations__card"
              to={`/butik/${product.id}/`}
              key={product.id}
            >
              {product.images?.[0] && (
                <img src={product.images[0]} alt="" loading="lazy" decoding="async" />
              )}
              <div className="product-recommendations__card-content">
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <strong>{formatPrice(product.price)}</strong>
                <ArrowRight size={18} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

ProductRecommendations.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentProduct: PropTypes.object,
};

export default ProductRecommendations;
