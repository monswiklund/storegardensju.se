import React from "react";

function OrderHeader({ order, isMobile, setViewMode }) {
  const stripeBase =
    order && typeof order.livemode === "boolean"
      ? order.livemode
        ? "https://dashboard.stripe.com"
        : "https://dashboard.stripe.com/test"
      : "";

  const stripeSessionUrl =
    order && stripeBase ? `${stripeBase}/checkout/sessions/${order.id}` : "";

  return (
    <div className="admin-detail-header">
      <div className="admin-order-summary">
        <div className="admin-order-summary-main">
          {/* Mobile Back Button */}
          {isMobile && (
            <button
              type="button"
              className="admin-btn-tertiary admin-back-btn-mobile"
              onClick={() => setViewMode("list")}
              style={{ marginRight: "0.5rem", padding: "4px 8px" }}
            >
              ←
            </button>
          )}
          <span className="admin-order-label">Ordernummer</span>
          <div className="admin-order-id-row">
            <span className="admin-detail-order-id">{order.id}</span>
          </div>
        </div>
      </div>

      <div className="admin-order-actions-row">
        {isMobile && !order && (
          <button
            type="button"
            className="admin-btn-secondary admin-back-btn"
            onClick={() => setViewMode("list")}
          >
            Tillbaka
          </button>
        )}
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() => window.print()}
        >
          Följesedel
        </button>
        {stripeSessionUrl && (
          <a
            className="admin-btn-secondary"
            href={stripeSessionUrl}
            target="_blank"
            rel="noreferrer"
          >
            Öppna i Stripe
          </a>
        )}
        {order.stripeUrl && (
          <a
            className="admin-btn-secondary"
            href={order.stripeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Betalning
          </a>
        )}
      </div>
    </div>
  );
}

export default OrderHeader;
