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
      <div className="admin-detail-meta">
        {/* Mobile Back Button */}
        {isMobile && (
          <button
            type="button"
            className="admin-btn-tertiary admin-back-btn-mobile"
            onClick={() => setViewMode("list")}
            style={{ marginBottom: "0.5rem", width: 'fit-content' }}
          >
            ← Tillbaka till listan
          </button>
        )}
        <span className="admin-detail-label">Ordernummer</span>
        <div className="admin-order-id-display">{order.id}</div>
      </div>

      <div className="admin-order-actions-row">
        <button
          type="button"
          className="admin-btn-secondary admin-btn-sm"
          onClick={() => window.print()}
        >
          Följesedel
        </button>
        {stripeSessionUrl && (
          <a
            className="admin-btn-secondary admin-btn-sm"
            href={stripeSessionUrl}
            target="_blank"
            rel="noreferrer"
          >
            Öppna i Stripe
          </a>
        )}
        {order.stripeUrl && (
          <a
            className="admin-btn-secondary admin-btn-sm"
            href={order.stripeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Betalningslänk
          </a>
        )}
      </div>
    </div>
  );
}

export default OrderHeader;
