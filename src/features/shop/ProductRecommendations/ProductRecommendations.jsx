import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ExploreMoreSection } from "../../../components";
import { formatPrice } from "../../../services/stripeService";
import "./ProductRecommendations.css";

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
  const relatedProducts = getRelatedProducts(products, currentProduct);

  if (relatedProducts.length === 0) {
    return (
      <ExploreMoreSection
        id="product-explore-more"
        eyebrow="GÅRDSBUTIK"
        title="Fortsätt upptäcka butiken"
        intro="Se fler handgjorda saker från gårdens ateljé och hitta din nästa favorit."
        background="alt"
        items={[
          {
            to: "/butik/",
            eyebrow: "Till sortimentet",
            title: "Se hela butiken",
            text: "Tillbaka till alla produkter och aktuellt sortiment.",
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
          <span>Från ateljén</span>
          <h2 id="product-recommendations-title">Fler saker att upptäcka</h2>
          <p>Fortsätt titta bland handgjorda produkter från Storegården 7.</p>
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
