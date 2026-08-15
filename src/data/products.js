// Produkter kommer från CMS eller Stripe. Lokal mockdata får inte synas i butiken.
export const products = [];

/**
 * Utility-funktioner för produktdata
 */

// Hämta produkt efter ID
export const getProductById = (id) => {
  return products.find(product => product.id === id);
};

// Hämta produkter per kategori
export const getProductsByCategory = (category) => {
  if (category === "alla") return products;
  return products.filter(product => product.category === category);
};

// Hämta alla unika kategorier
export const getCategories = () => {
  const categories = [...new Set(products.map(p => p.category))];
  return ["alla", ...categories];
};

// Formatera pris (850 => "850 kr")
export const formatPrice = (price) => {
  return `${price.toLocaleString('sv-SE')} kr`;
};
