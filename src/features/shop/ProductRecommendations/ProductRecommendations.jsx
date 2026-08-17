import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ExploreMoreSection } from "../../../components";
import { formatPrice } from "../../../services/stripeService";
import "./ProductRecommendations.css";

import usePageCopy from "../../../hooks/usePageCopy";

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
    return (
      <ExploreMoreSection
        id="product-explore-more"
        eyebrow={copy("recommendations.empty-eyebrow")}
        title={copy("recommendations.empty-title")}
        intro={copy("recommendations.empty-intro")}
        background="alt"
        items={[
          {
            to: "/butik/",
            eyebrow: copy("recommendations.item-eyebrow"),
            title: copy("recommendations.item-title"),
            text: copy("recommendations.item-text"),
            featured: true,
          },
        ]}
      />
    );
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
              <img src={product.images?.[0]} alt="" loading="lazy" />
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
