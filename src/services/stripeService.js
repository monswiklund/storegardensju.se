/**
 * Stripe Service - Hämtar produktdata från Stripe via backend
 *
 * Denna service kommunicerar med Go-backend som i sin tur
 * hämtar produkter från Stripe API.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

/**
 * Hämta alla aktiva produkter från Stripe
 * @returns {Promise<Array>} Lista med produkter
 */
export async function getStripeProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const products = await response.json();
    return products || [];
  } catch (error) {
    console.error("Error fetching Stripe products:", error);
    return [];
  }
}

/**
 * Hämta en specifik produkt från Stripe
 * @param {string} productId - Stripe produkt-ID
 * @returns {Promise<Object|null>} Produkt eller null
 */
export async function getStripeProductById(productId) {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Stripe product:", error);
    return null;
  }
}

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
export async function verifySession(sessionId) {
  try {
    const response = await fetch(
      `${API_URL}/verify-session?session_id=${sessionId}`
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
