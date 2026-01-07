import React from "react";
import { formatAmount } from "../../adminUtils";
import { CopyIcon, CheckIcon } from "../AdminIcons";

function OrderLineItems({ order, onCopy, copiedField }) {
  const stripeBase =
    order && typeof order.livemode === "boolean"
      ? order.livemode
        ? "https://dashboard.stripe.com"
        : "https://dashboard.stripe.com/test"
      : "";

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Varor</h3>
      </div>
      <div className="admin-lineitems-list">
        {order.lineItems.map((item, index) => {
          const total = item.amountTotal || item.unitAmount * item.quantity;
          return (
            <div
              className="admin-lineitem"
              key={`${item.priceId || index}-${index}`}
            >
              <div className="admin-lineitem-info">
                <p className="admin-lineitem-title">
                  {item.description || "Okänd produkt"}
                </p>
                {typeof item.stock === "number" &&
                  item.stock > 0 &&
                  item.stock <= 2 && (
                    <span className="admin-stock-warning">
                      Lågt lager: {item.stock} kvar
                    </span>
                  )}
                {typeof item.stock === "number" && item.stock === 0 && (
                  <span className="admin-stock-warning admin-stock-warning-out">
                    Slut i lager
                  </span>
                )}
                {item.productId && stripeBase && (
                  <div className="admin-lineitem-link-row">
                    <a
                      className="admin-lineitem-link"
                      href={`${stripeBase}/products/${item.productId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Stripe‑produkt
                    </a>
                    <button
                      type="button"
                      className="admin-copy-btn admin-copy-btn-compact admin-copy-btn-icon"
                      onClick={() =>
                        onCopy(item.productId, `product-${item.productId}`)
                      }
                      aria-label="Kopiera produkt-ID"
                      title="Kopiera produkt-ID"
                      data-tooltip={
                        copiedField === `product-${item.productId}`
                          ? "Kopierat!"
                          : "Kopiera produkt-ID"
                      }
                      data-tooltip-active={
                        copiedField === `product-${item.productId}`
                      }
                    >
                      {copiedField === `product-${item.productId}` ? (
                        <CheckIcon title="Kopierat" />
                      ) : (
                        <CopyIcon title="Kopiera" />
                      )}
                    </button>
                  </div>
                )}
                {item.priceId && stripeBase && (
                  <div className="admin-lineitem-link-row">
                    <a
                      className="admin-lineitem-link admin-lineitem-link-muted"
                      href={`${stripeBase}/prices/${item.priceId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Stripe‑pris
                    </a>
                    <button
                      type="button"
                      className="admin-copy-btn admin-copy-btn-compact admin-copy-btn-icon"
                      onClick={() =>
                        onCopy(item.priceId, `price-${item.priceId}`)
                      }
                      aria-label="Kopiera pris-ID"
                      title="Kopiera pris-ID"
                      data-tooltip={
                        copiedField === `price-${item.priceId}`
                          ? "Kopierat!"
                          : "Kopiera pris-ID"
                      }
                      data-tooltip-active={
                        copiedField === `price-${item.priceId}`
                      }
                    >
                      {copiedField === `price-${item.priceId}` ? (
                        <CheckIcon title="Kopierat" />
                      ) : (
                        <CopyIcon title="Kopiera" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <span className="admin-lineitem-quantity">x{item.quantity}</span>
              <span className="admin-lineitem-amount">
                {formatAmount(total)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderLineItems;
