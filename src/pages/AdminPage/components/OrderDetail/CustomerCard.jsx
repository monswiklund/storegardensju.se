import React from "react";
import { formatAmount } from "../../adminUtils";
import { CopyIcon, CheckIcon } from "../AdminIcons";

function CustomerCard({ order, customerHistory, onCopy, copiedField, onCustomerFilter }) {
  const customerName = order?.customerName || "";
  const customerEmail = order?.customerEmail || "";
  const customerPhone = order?.customerPhone || "";
  const shippingAddress = order?.shippingAddress || "";

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
          <h3>Kund</h3>
          {order?.customerId && (
            <a
              href={`https://dashboard.stripe.com/${
                order.livemode ? "" : "test/"
              }customers/${order.customerId}`}
              target="_blank"
              rel="noreferrer"
              className="admin-link-sm"
              style={{ fontSize: "12px", textDecoration: "underline" }}
            >
              Öppna i Stripe ↗
            </a>
          )}
        </div>
        {customerHistory && (
          <button
            type="button"
            className="admin-badge"
            onClick={() => onCustomerFilter(customerEmail)}
            title="Visa alla ordrar från denna kund"
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {customerHistory.count === 0
              ? "Första köpet"
              : `${customerHistory.count} tidigare · ${formatAmount(customerHistory.total)}`}
          </button>
        )}
      </div>
      <div className="admin-customer-grid">
        <div className="admin-customer-field">
          <span className="admin-customer-label">Namn</span>
          <span className="admin-customer-value">
            {customerName || "Okänd kund"}
          </span>
        </div>
        <div className="admin-customer-field">
          <span className="admin-customer-label">E-post</span>
          <div className="admin-customer-value">
            {customerEmail ? (
              <div className="admin-detail-inline">
                <a
                  className="admin-detail-link"
                  href={`mailto:${customerEmail}`}
                >
                  {customerEmail}
                </a>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-icon"
                  onClick={() => onCopy(customerEmail, "email")}
                  title="Kopiera e-post"
                >
                  {copiedField === "email" ? (
                    <CheckIcon size={14} />
                  ) : (
                    <CopyIcon size={14} />
                  )}
                </button>
              </div>
            ) : (
              "—"
            )}
          </div>
        </div>
        <div className="admin-customer-field">
          <span className="admin-customer-label">Leveransadress</span>
          <div className="admin-customer-value">
            {shippingAddress ? (
              <div className="admin-detail-inline">
                <span className="admin-customer-text">{shippingAddress}</span>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-icon"
                  onClick={() => onCopy(shippingAddress, "address")}
                  title="Kopiera adress"
                >
                  {copiedField === "address" ? (
                    <CheckIcon size={14} />
                  ) : (
                    <CopyIcon size={14} />
                  )}
                </button>
              </div>
            ) : (
              "—"
            )}
          </div>
        </div>
        <div className="admin-customer-field">
          <span className="admin-customer-label">Telefon</span>
          <div className="admin-customer-value">
            {customerPhone ? (
              <div className="admin-detail-inline">
                <a className="admin-detail-link" href={`tel:${customerPhone}`}>
                  {customerPhone}
                </a>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-icon"
                  onClick={() => onCopy(customerPhone, "phone")}
                  title="Kopiera telefon"
                >
                  {copiedField === "phone" ? (
                    <CheckIcon size={14} />
                  ) : (
                    <CopyIcon size={14} />
                  )}
                </button>
              </div>
            ) : (
              "—"
            )}
          </div>
        </div>
        {order.customerMessage && (
          <div className="admin-customer-field admin-customer-field-wide">
            <span className="admin-customer-label">Meddelande från kund</span>
            <div className="admin-customer-text" style={{ fontStyle: 'italic', borderLeft: '3px solid #e5e7eb', paddingLeft: '1rem', marginTop: '0.5rem' }}>
              &quot;{order.customerMessage}&quot;
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerCard;
