import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "../AdminIcons";

function OrderMeta({ order, onCopy, copiedField }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const stripeBase =
    order && typeof order.livemode === "boolean"
      ? order.livemode
        ? "https://dashboard.stripe.com"
        : "https://dashboard.stripe.com/test"
      : "";

  const stripeCustomerUrl =
    order?.customerId && stripeBase
      ? `${stripeBase}/customers/${order.customerId}`
      : "";

  return (
    <div className="admin-card admin-meta-card">
      <button
        type="button"
        className="admin-meta-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Tekniska detaljer</span>
        <span className={`admin-chevron ${isExpanded ? "up" : "down"}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="admin-tech-block-content">
          <div className="admin-tech-row">
            <span className="admin-tech-label">Session ID</span>
            <span className="admin-tech-value">
              <span className="admin-order-subid">{order.id}</span>
              <button
                type="button"
                className="admin-copy-btn admin-copy-btn-compact admin-copy-btn-icon"
                onClick={() => onCopy(order.id, "order")}
                aria-label="Kopiera Session-ID"
                title="Kopiera Session-ID"
                data-tooltip={
                  copiedField === "order" ? "Kopierat!" : "Kopiera Session-ID"
                }
                data-tooltip-active={copiedField === "order"}
              >
                {copiedField === "order" ? (
                  <CheckIcon title="Kopierat" />
                ) : (
                  <CopyIcon title="Kopiera" />
                )}
              </button>
            </span>
          </div>
          {order.paymentIntentId && (
            <div className="admin-tech-row">
              <span className="admin-tech-label">PaymentIntent ID</span>
              <span className="admin-tech-value">
                <span className="admin-order-subid">
                  {order.paymentIntentId}
                </span>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-compact admin-copy-btn-icon"
                  onClick={() =>
                    onCopy(order.paymentIntentId, "payment-intent")
                  }
                  aria-label="Kopiera PaymentIntent-ID"
                  title="Kopiera PaymentIntent-ID"
                  data-tooltip={
                    copiedField === "payment-intent"
                      ? "Kopierat!"
                      : "Kopiera PaymentIntent-ID"
                  }
                  data-tooltip-active={copiedField === "payment-intent"}
                >
                  {copiedField === "payment-intent" ? (
                    <CheckIcon title="Kopierat" />
                  ) : (
                    <CopyIcon title="Kopiera" />
                  )}
                </button>
              </span>
            </div>
          )}
          {order.customerId && (
            <div className="admin-tech-row">
              <span className="admin-tech-label">Customer ID</span>
              <span className="admin-tech-value">
                <span className="admin-order-subid">{order.customerId}</span>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-compact admin-copy-btn-icon"
                  onClick={() => onCopy(order.customerId, "customer-id")}
                  aria-label="Kopiera Customer-ID"
                  title="Kopiera Customer-ID"
                  data-tooltip={
                    copiedField === "customer-id"
                      ? "Kopierat!"
                      : "Kopiera Customer-ID"
                  }
                  data-tooltip-active={copiedField === "customer-id"}
                >
                  {copiedField === "customer-id" ? (
                    <CheckIcon title="Kopierat" />
                  ) : (
                    <CopyIcon title="Kopiera" />
                  )}
                </button>
                {stripeCustomerUrl && (
                  <a
                    className="admin-detail-link admin-detail-link-muted"
                    href={stripeCustomerUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Öppna kund i Stripe
                  </a>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderMeta;
