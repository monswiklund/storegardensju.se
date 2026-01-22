import React, { useMemo } from "react";
import {
  FULFILLMENT_LABELS,
  PAYMENT_LABELS,
  PAYMENT_CHIP_CLASS,
  HIGH_ORDER_THRESHOLD,
  TRACKING_CARRIER_OPTIONS,
} from "../../adminConstants";
import {
  formatDateTime,
  formatListEventLabel,
  formatAmount,
} from "../../adminUtils";
import { CopyIcon, CheckIcon } from "../AdminIcons";

function OrderStatusCard({ order, latestEvent, onCopy, copiedField }) {
  const paymentStatus = order?.paymentStatus || "";
  const isHighValueOrder = (order?.amountTotal || 0) >= HIGH_ORDER_THRESHOLD;
  const isUnpaid = paymentStatus === "unpaid";
  const shippingRateLabel = order?.shippingRate || "";
  const isPickup =
    shippingRateLabel && /hämta|hämtning|pickup/i.test(shippingRateLabel);
  const shippingChipLabel = shippingRateLabel
    ? isPickup
      ? "Hämtning"
      : "Frakt"
    : "";

  const trackingCarrierLabel = useMemo(() => {
    const carrier = (order?.trackingCarrier || "auto").toLowerCase();
    if (!carrier || carrier === "auto") return "Auto";
    const option = TRACKING_CARRIER_OPTIONS.find(
      (item) => item.value === carrier
    );
    return option?.label || carrier;
  }, [order?.trackingCarrier]);

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
      <div className="admin-detail-header-row">
        <h3>Status & Leverans</h3>
      </div>
      <div className="admin-detail-list">
        <div className="admin-detail-row">
          <span className="admin-detail-label">Totalt</span>
          <span className="admin-detail-value admin-strong">
            {formatAmount(order.amountTotal)}
          </span>
        </div>
        <div className="admin-detail-row">
          <span className="admin-detail-label">Status</span>
          <div className="admin-detail-value admin-detail-value-stack">
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
              {isHighValueOrder && (
                <span className="admin-chip admin-chip-warning">Hög order</span>
              )}
              {isUnpaid && (
                <span className="admin-chip admin-chip-warning">Följ upp</span>
              )}
            </div>
            {latestEvent && (
              <p className="admin-detail-meta-text">
                Senaste: {formatListEventLabel(latestEvent)} ·{" "}
                {formatDateTime(latestEvent.timestamp)}
              </p>
            )}
          </div>
        </div>
        <div className="admin-detail-row">
          <span className="admin-detail-label">Skapad</span>
          <span className="admin-detail-value">
            {formatDateTime(order.created)}
          </span>
        </div>
        <div className="admin-detail-row">
          <span className="admin-detail-label">Leverans</span>
          <span className="admin-detail-value">
            {order.shippingRate || "Fraktval saknas"}
          </span>
        </div>
        <div className="admin-detail-row">
          <span className="admin-detail-label">Spårning</span>
          <div className="admin-detail-value">
            {order.trackingNumber ? (
              <div className="admin-detail-inline">
                <span className="admin-detail-strong">
                  {order.trackingNumber}
                </span>
                <span className="admin-chip admin-chip-tracking">
                  {trackingCarrierLabel}
                </span>
                <button
                  type="button"
                  className="admin-copy-btn admin-copy-btn-icon"
                  onClick={() => onCopy(order.trackingNumber, "tracking")}
                  aria-label="Kopiera spårningsnummer"
                  title="Kopiera spårningsnummer"
                  data-tooltip={
                    copiedField === "tracking"
                      ? "Kopierat!"
                      : "Kopiera spårningsnummer"
                  }
                  data-tooltip-active={copiedField === "tracking"}
                >
                  {copiedField === "tracking" ? (
                    <CheckIcon title="Kopierat" />
                  ) : (
                    <CopyIcon title="Kopiera" />
                  )}
                </button>
                {trackingInfo && (
                  <a
                    className="admin-detail-link admin-detail-link-muted"
                    href={trackingInfo.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Spåra hos {trackingInfo.label}
                  </a>
                )}
              </div>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderStatusCard;
