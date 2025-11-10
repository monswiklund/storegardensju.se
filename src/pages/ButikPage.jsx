import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageSection } from "../components";
import { products, getCategories, formatPrice } from "../data/products";
import './ButikPage.css';

/**
 * ButikPage - Huvudsida för produktkatalog
 *
 * Mål: Lära dig React hooks (useState) och list rendering
 *
 * Koncept som övas:
 * - useState för filter-state
 * - Array.map() för att rendera produkter
 * - Conditional rendering
 * - Event handlers (onClick)
 */

function ButikPage() {
    // State för aktiv kategori-filter
    const [activeCategory, setActiveCategory] = useState("alla");

    // Hämta alla kategorier från produktdata
    const categories = getCategories(); // ["alla", "keramik", "konst"]

    const filteredProducts = activeCategory === "alla"
        ? products
        : products.filter(product => product.category === activeCategory);

    return (
        <main role="main" id="main-content">
            <PageSection background="white" spacing="default">
                {/* Header */}
                <div className="butik-header">
                    <h1>Butik</h1>
                    <p>Handgjord konst och keramik från lokala konstnärer</p>
                </div>

                <div className="category-filters">
                    {categories.map(category => {
                        const label = category.charAt(0).toUpperCase() + category.slice(1);
                        return(
                            <button key={category} className={activeCategory === category ? "active" : ""}
                                    onClick={() => setActiveCategory(category)}>
                                {label}
                            </button>
                        )
                    })}
                </div>

                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <div className="product-card" key={product.id}>
                            <img src={product.images[0]} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p className="price">{formatPrice(product.price)}</p>
                            <button type="button">Lägg i varukorg</button>
                        </div>
                    ))}
                </div>

            </PageSection>
        </main>
    );
}

export default ButikPage;
