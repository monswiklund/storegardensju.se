/**
 * Stripe Service - butikens hjälpfunktioner och sessionsverifiering via Go-backend.
 * Produkterna själva kommer från CMS:et (cmsService.fetchShopProducts).
 */
import { getApiBaseUrl } from "../config/apiBaseUrl";

const API_URL = getApiBaseUrl();

/**
 * Hämta unika kategorier från produktlistan
 * @param {Array} products - Lista med produkter
 * @returns {Array<string>} Lista med kategorier
 */
export function getCategories(products) {
  const categories = [...new Set(products.map((p) => p.category))];
  return ["alla", ...categories.filter((c) => c)];
}

/**
 * Formatera pris till svensk valuta
 * @param {number} price - Pris i SEK
 * @returns {string} Formaterat pris
 */
export function formatPrice(price) {
  return `${price.toLocaleString("sv-SE")} kr`;
}

/**
 * Verifiera Stripe-session via backend
 * @param {string} sessionId - Session-ID från Stripe
 * @returns {Promise<boolean>} Sant om sessionen är giltig och betald
 */
export async function verifySession(sessionId, token) {
  try {
    const params = new URLSearchParams();
    params.set("session_id", sessionId);
    if (token) {
      params.set("token", token);
    }
    const response = await fetch(
      `${API_URL}/verify-session?${params.toString()}`
    );

    if (!response.ok) {
      console.error(`Verification failed: ${response.status}`);
      return false;
    }

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error("Error verifying session:", error);
    return false;
  }
}
