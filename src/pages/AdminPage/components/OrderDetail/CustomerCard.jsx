import React from "react";
import { formatAmount } from "../../adminUtils";
import { CopyIcon, CheckIcon } from "../AdminIcons";

function CustomerCard({ order, customerHistory, onCopy, copiedField, onCustomerFilter }) {
  const customerName = order?.customerName || "";
  const customerEmail = order?.customerEmail || "";
  const customerPhone = order?.customerPhone || "";
  const shippingAddress = order?.shippingAddress || "";

  return (
    <div className="admin-card admin-customer-card">
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
            className="admin-customer-chip"
            onClick={() => onCustomerFilter(customerEmail)}
            title="Visa alla ordrar från denna kund"
          >
            {customerHistory.count === 0
              ? "Första ordern"
              : `${customerHistory.count} tidigare · ${formatAmount(
                  customerHistory.total
                )}`}
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
          <span className="admin-customer-label">Email</span>
          <span className="admin-customer-value">
            {customerEmail ? (
              <span className="admin-detail-inline">
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
                  aria-label="Kopiera email"
                  title="Kopiera email"
                  data-tooltip={
                    copiedField === "email" ? "Kopierat!" : "Kopiera email"
                  }
                  data-tooltip-active={copiedField === "email"}
                >
                  {copiedField === "email" ? (
                    <CheckIcon title="Kopierat" />
                  ) : (
                    <CopyIcon title="Kopiera" />
                  )}
                </button>
              </span>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="admin-customer-field">
          <span className="admin-customer-label">Adress</span>
          <span className="admin-customer-value">
            {shippingAddress ? (
              <span className="admin-detail-inline">
                <span className="admin-customer-text">{shippingAddress}</span>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-icon"
                  onClick={() => onCopy(shippingAddress, "address")}
                  aria-label="Kopiera adress"
                  title="Kopiera adress"
                  data-tooltip={
                    copiedField === "address" ? "Kopierat!" : "Kopiera adress"
                  }
                  data-tooltip-active={copiedField === "address"}
                >
                  {copiedField === "address" ? (
                    <CheckIcon title="Kopierat" />
                  ) : (
                    <CopyIcon title="Kopiera" />
                  )}
                </button>
              </span>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="admin-customer-field">
          <span className="admin-customer-label">Telefon</span>
          <span className="admin-customer-value">
            {customerPhone ? (
              <span className="admin-detail-inline">
                <a className="admin-detail-link" href={`tel:${customerPhone}`}>
                  {customerPhone}
                </a>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-icon"
                  onClick={() => onCopy(customerPhone, "phone")}
                  aria-label="Kopiera telefon"
                  title="Kopiera telefon"
                  data-tooltip={
                    copiedField === "phone" ? "Kopierat!" : "Kopiera telefon"
                  }
                  data-tooltip-active={copiedField === "phone"}
                >
                  {copiedField === "phone" ? (
                    <CheckIcon title="Kopierat" />
                  ) : (
                    <CopyIcon title="Kopiera" />
                  )}
                </button>
              </span>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="admin-customer-field admin-customer-field-wide">
          <span className="admin-customer-label">Meddelande</span>
          <span className="admin-customer-value">
            {order.customerMessage ? (
              <span className="admin-detail-inline">
                <span className="admin-customer-text">
                  {order.customerMessage}
                </span>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-icon"
                  onClick={() => onCopy(order.customerMessage, "message")}
                  aria-label="Kopiera meddelande"
                  title="Kopiera meddelande"
                  data-tooltip={
                    copiedField === "message"
                      ? "Kopierat!"
                      : "Kopiera meddelande"
                  }
                  data-tooltip-active={copiedField === "message"}
                >
                  {copiedField === "message" ? (
                    <CheckIcon title="Kopierat" />
                  ) : (
                    <CopyIcon title="Kopiera" />
                  )}
                </button>
              </span>
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CustomerCard;
