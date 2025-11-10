/**
 * Mock produktdata för Storegården 7 butik
 *
 * Struktur:
 * - id: Unik identifierare (används i routing, cart logic)
 * - name: Produktnamn
 * - price: Pris i SEK (heltal för att undvika floating point issues)
 * - description: Kort beskrivning
 * - longDescription: Detaljerad beskrivning för produktsidan
 * - images: Array av bildvägar (första bilden är primär)
 * - category: För filtrering ("keramik", "konst", etc.)
 * - stock: Lagerstatus (antal i lager)
 * - artist: Konstnärens namn
 */

export const products = [
  {
    id: "keramik-vas-001",
    name: "Handgjord Keramikvas - Blå",
    price: 150,
    description: "Elegant handgjord vas i blå glasyr",
    longDescription: "Denna vackra vas är handgjord av lokal keramiker. Varje vas är unik med små variationer i glasyr och form. Perfekt för både torkade och färska blommor.",
    images: [
      "/images/products/taxam-1.webp",
      "/images/products/vas-bla-2.jpg"
    ],
    category: "keramik",
    stock: 3,
    artist: "Anna Wiklund"
  }
];

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
