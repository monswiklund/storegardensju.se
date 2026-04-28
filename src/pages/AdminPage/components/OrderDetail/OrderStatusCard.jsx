import React, { useMemo } from "react";
import {
  FULFILLMENT_LABELS,
  PAYMENT_LABELS,
  PAYMENT_CHIP_CLASS,
} from "../../adminConstants";
import {
  formatDateTime,
  formatAmount,
} from "../../adminUtils";

function OrderStatusCard({ order, latestEvent, onCopy, copiedField }) {
  const paymentStatus = order?.paymentStatus || "";
  const shippingRateLabel = order?.shippingRate || "";
  const isPickup =
    shippingRateLabel && /hämta|hämtning|pickup/i.test(shippingRateLabel);
  const shippingChipLabel = shippingRateLabel
    ? isPickup
      ? "Hämtning"
      : "Frakt"
    : "";

  const trackingInfo = useMemo(() => {
    const raw = order?.trackingNumber || "";
    const cleanTracking = raw.replace(/\s+/g, "").trim();
    if (!cleanTracking) return null;

    const carrier = (order?.trackingCarrier || "auto").toLowerCase();
    const rateLabel = (shippingRateLabel || "").toLowerCase();

    const buildCarrierLink = (value) => {
      switch (value) {
        case "postnord":
          return {
            label: "PostNord",
            url: `https://www.postnord.se/verktyg/sok-brev-paket?search=${encodeURIComponent(
              cleanTracking
            )}`,
          };
        case "dhl":
          return {
            label: "DHL",
            url: `https://www.dhl.com/se-sv/home/tracking/tracking-express.html?tracking-id=${encodeURIComponent(
              cleanTracking
            )}`,
          };
        case "schenker":
          return {
            label: "Schenker",
            url: `https://www.dbschenker.com/se-sv/verktyg/soek-sending?refNumber=${encodeURIComponent(
              cleanTracking
            )}`,
          };
        default:
          return null;
      }
    };

    if (carrier && carrier !== "auto") {
      return (
        buildCarrierLink(carrier) || {
          label: "ParcelsApp",
          url: `https://parcelsapp.com/sv/tracking/${encodeURIComponent(
            cleanTracking
          )}`,
        }
      );
    }

    const looksLikePostNord = /[A-Z]{2}\d{9}[A-Z]{2}$/.test(cleanTracking);
    const looksLikeNordic = /SE\d{9,11}$/.test(cleanTracking);

    if (
      rateLabel.includes("postnord") ||
      looksLikePostNord ||
      looksLikeNordic
    ) {
      return buildCarrierLink("postnord");
    }
    if (rateLabel.includes("dhl")) {
      return buildCarrierLink("dhl");
    }
    if (rateLabel.includes("schenker")) {
      return buildCarrierLink("schenker");
    }

    return {
      label: "ParcelsApp",
      url: `https://parcelsapp.com/sv/tracking/${encodeURIComponent(
        cleanTracking
      )}`,
    };
  }, [order?.trackingNumber, order?.trackingCarrier, shippingRateLabel]);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Status & Leverans</h3>
      </div>
      <div className="admin-status-overview-grid">
        <div className="admin-status-overview-card admin-status-overview-card--total">
          <span>Totalt</span>
          <strong>{formatAmount(order.amountTotal)}</strong>
        </div>
        <div className="admin-status-overview-card">
          <span>Status</span>
            <div className="admin-detail-chip-row">
              <span
                className={`admin-chip admin-chip-${
                  order.fulfillment || "new"
                }`}
              >
                {FULFILLMENT_LABELS[order.fulfillment] || order.fulfillment}
              </span>
              <span
                className={`admin-chip ${
                  PAYMENT_CHIP_CLASS[paymentStatus] || "admin-chip-payment"
                }`}
              >
                {PAYMENT_LABELS[paymentStatus] || paymentStatus}
              </span>
              {shippingChipLabel && (
                <span
                  className={`admin-chip ${
                    isPickup ? "admin-chip-pickup" : "admin-chip-delivery"
                  }`}
                >
                  {shippingChipLabel}
                </span>
              )}
            </div>
            {latestEvent && (
              <p className="admin-muted">
                Senast {formatDateTime(latestEvent.timestamp)}
              </p>
            )}
        </div>
        <div className="admin-status-overview-card">
          <span>Beställd</span>
          <strong>{formatDateTime(order.created)}</strong>
        </div>
        <div className="admin-status-overview-card">
          <span>Fraktmetod</span>
          <strong>{order.shippingRate || "Hämtas i butik"}</strong>
        </div>
        <div className="admin-status-overview-card admin-status-overview-card--tracking">
          <span>Spårning</span>
            {order.trackingNumber ? (
              <div className="admin-detail-inline">
                <strong className="admin-tracking-number">
                  {order.trackingNumber}
                </strong>
                {trackingInfo && (
                  <a
                    className="admin-link-btn"
                    href={trackingInfo.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Spåra ({trackingInfo.label})
                  </a>
                )}
              </div>
            ) : (
              <span className="admin-muted">—</span>
            )}
        </div>
      </div>
    </div>
  );
}

export default OrderStatusCard;
