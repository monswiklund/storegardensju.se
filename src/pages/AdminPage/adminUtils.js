import { formatPrice } from "../../services/stripeService";
import { FULFILLMENT_LABELS } from "./adminConstants";

export const formatAmount = (amountMinor) =>
  formatPrice((amountMinor || 0) / 100);

export const formatDateTime = (timestamp) =>
  new Date(timestamp * 1000).toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatEventLabel = (event) => {
  if (!event) return "";
  switch (event.type) {
    case "created":
      return "Order skapad";
    case "paid":
      return "Betald";
    case "fulfillment":
      return `Status satt till ${
        FULFILLMENT_LABELS[event.value] || event.value || "okänd"
      }`;
    case "note":
      return "Intern anteckning uppdaterad";
    case "customer_message":
      return "Kundmeddelande lämnat";
    case "tracking":
      return "Spårningsnummer uppdaterat";
    case "tracking_carrier":
      return "Transportör uppdaterad";
    default:
      return "Händelse";
  }
};

export const formatListEventLabel = (event) => {
  if (!event) return "";
  switch (event.type) {
    case "created":
      return "Skapad";
    case "paid":
      return "Betald";
    case "fulfillment":
      return `Status: ${
        FULFILLMENT_LABELS[event.value] || event.value || "okänd"
      }`;
    case "note":
      return "Note uppd.";
    case "customer_message":
      return "Meddelande";
    case "tracking":
      return "Spårning";
    case "tracking_carrier":
      return "Transportör";
    default:
      return "Händelse";
  }
};
