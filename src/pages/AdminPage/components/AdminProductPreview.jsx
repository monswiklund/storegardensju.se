import PropTypes from "prop-types";
import { ImageOff } from "lucide-react";

const formatPrice = (priceSek) => {
  const value = Number.parseFloat(priceSek);
  if (!Number.isFinite(value)) return "— kr";
  return `${new Intl.NumberFormat("sv-SE").format(value)} kr`;
};

/**
 * Mirrors the storefront product card (see pages/ButikPage.jsx) closely enough
 * to judge a product while editing it, without importing the storefront CSS
 * into the admin surface.
 */
export default function AdminProductPreview({
  name,
  description,
  price,
  categoryLabel,
  stock,
  imageUrl,
}) {
  const stockValue = Number.parseInt(stock, 10);
  const hasStock = Number.isFinite(stockValue);
  const isSoldOut = hasStock && stockValue === 0;
  const isUnique = hasStock && stockValue === 1;

  return (
    <article className={`apv-card ${isSoldOut ? "is-sold-out" : ""}`}>
      <div className="apv-image">
        {imageUrl ? (
          <img src={imageUrl} alt="" />
        ) : (
          <div className="apv-image-empty">
            <ImageOff size={26} aria-hidden="true" />
            <span>Ingen bild vald</span>
          </div>
        )}
        {isSoldOut && <span className="apv-badge">SÅLD</span>}
      </div>

      <div className="apv-content">
        <h3>{String(name).trim() || "Produktnamn"}</h3>
        <p className="apv-description">
          {String(description).trim() || "Ingen beskrivning ännu."}
        </p>
        <p className="apv-meta">
          {categoryLabel}
          {isUnique && !isSoldOut && " · Unikt exemplar"}
        </p>
        {hasStock && stockValue > 1 && (
          <p className="apv-stock">{stockValue} i lager</p>
        )}
        <div className="apv-price-row">
          <p className="apv-price">{formatPrice(price)}</p>
          <span className="apv-buy" aria-hidden="true">
            {isSoldOut ? "Slutsåld" : "Lägg i varukorg"}
          </span>
        </div>
      </div>
    </article>
  );
}

const stringOrNumber = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

AdminProductPreview.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: stringOrNumber.isRequired,
  categoryLabel: PropTypes.string.isRequired,
  stock: stringOrNumber.isRequired,
  imageUrl: PropTypes.string,
};
