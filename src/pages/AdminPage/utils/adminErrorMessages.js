const ERROR_CODE_MESSAGES = {
  rate_limited: "Försök igen om en stund.",
  upload_store_unavailable: "Bilduppladdning är otillgänglig just nu.",
  not_found: "Resursen kunde inte hittas.",
  method_not_allowed: "Åtgärden stöds inte.",
  forbidden: "Du saknar behörighet för denna åtgärd.",
  unauthorized: "Sessionen har löpt ut. Logga in igen.",
  validation_failed: "Indata är ogiltig. Kontrollera fälten.",
  conflict: "Konflikt: resursen har ändrats av någon annan.",
  payload_too_large: "Filen eller datan är för stor.",
};

const STATUS_FALLBACK = {
  400: "Ogiltig förfrågan.",
  401: "Sessionen har löpt ut. Logga in igen.",
  403: "Du saknar behörighet för denna åtgärd.",
  404: "Resursen kunde inte hittas.",
  409: "Konflikt: resursen har ändrats av någon annan.",
  413: "Filen eller datan är för stor.",
  429: "Försök igen om en stund.",
  500: "Serverfel. Försök igen.",
  502: "Servern svarar inte. Försök igen.",
  503: "Tjänsten är otillgänglig. Försök igen senare.",
};

const NETWORK_FALLBACK = "Nätverksfel. Kontrollera anslutningen och försök igen.";
const GENERIC_FALLBACK = "Ett fel uppstod. Försök igen.";

export function mapErrorToUserMessage(err) {
  if (!err) return GENERIC_FALLBACK;
  if (err.code && ERROR_CODE_MESSAGES[err.code]) {
    return ERROR_CODE_MESSAGES[err.code];
  }
  if (err.status && STATUS_FALLBACK[err.status]) {
    return STATUS_FALLBACK[err.status];
  }
  const msg = String(err.message || "").toLowerCase();
  if (!err.status && msg.includes("failed to fetch")) {
    return NETWORK_FALLBACK;
  }
  return GENERIC_FALLBACK;
}
