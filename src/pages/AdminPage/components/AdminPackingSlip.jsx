import React from "react";
import { createPortal } from "react-dom";
import "./AdminPackingSlip.css";
import { formatDateTime } from "../adminUtils";

function AdminPackingSlip({ order }) {
  if (!order) return null;

  const orderId = order.id || "";
  const date = order.created ? formatDateTime(order.created) : "";
  const customerName = order.customerName || order.shippingDetails?.name || "";
  const address = order.shippingAddress || "";
  const displayAddress = address.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));

  const items = order.lineItems || [];

  return createPortal(
    <div className="admin-packing-slip">
      <div className="packing-header">
        <div className="packing-brand">
          <h1>Storegården 7</h1>
          <p>storegardensju.se</p>
        </div>
        <div className="packing-meta">
          <p className="packing-title">Följesedel</p>
          <p className="packing-ref">Order #{orderId}</p>
          <p className="packing-ref">{date}</p>
        </div>
      </div>

      <div className="packing-grid">
        <div className="packing-section">
          <h3>Leverans till</h3>
          <div className="packing-address">
            <p>
              <strong>{customerName}</strong>
            </p>
            <p>{displayAddress}</p>
            {order.customerPhone && <p>{order.customerPhone}</p>}
            {order.customerEmail && <p>{order.customerEmail}</p>}
          </div>
        </div>
        <div className="packing-section">
          <h3>Avsändare</h3>
          <div className="packing-address">
            <p>
              <strong>Storegården 7</strong>
            </p>
            <p>Storegården 7</p>
            <p>533 91 Götene</p>
            <p>Sverige</p>
          </div>
        </div>
      </div>

      <table className="packing-items">
        <thead>
          <tr>
            <th>Produkt</th>
            <th className="packing-col-qty">Antal</th>
            <th className="packing-col-check">Packad</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <strong>{item.description}</strong>
                {/* Variant info could go here if available */}
              </td>
              <td className="packing-col-qty">{item.quantity}</td>
              <td className="packing-col-check">
                <span className="packing-box"></span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.customerMessage && (
        <div
          style={{
            marginBottom: "2rem",
            border: "1px solid #ccc",
            padding: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Meddelande från kund:
          </h3>
          <p style={{ fontSize: "14px" }}>{order.customerMessage}</p>
        </div>
      )}

      {order.adminNote && (
        <div
          style={{
            marginBottom: "2rem",
            border: "1px dashed #999",
            padding: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Intern notering (syns ej för kund):
          </h3>
          <p style={{ fontSize: "14px" }}>{order.adminNote}</p>
        </div>
      )}

      <div className="packing-footer">
        <p>
          Tack för din beställning! Har du frågor? Kontakta oss på
          info@storegardensju.se
        </p>
      </div>
    </div>,
    document.body
  );
}

export default AdminPackingSlip;
