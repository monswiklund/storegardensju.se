import { useParams, Link } from 'react-router-dom';
import { PageSection } from "../components";
import { getProductById, formatPrice } from "../data/products";
import './ProductDetailPage.css';

/**
 * ProductDetailPage - Detaljsida för enskild produkt
 *
 * Mål: Lära dig dynamic routing och useParams hook
 *
 * Koncept som övas:
 * - useParams() för att läsa URL-parametrar
 * - Conditional rendering (produkt finns/finns inte)
 * - Link component för navigation
 */

function ProductDetailPage() {
    // TODO(human): Hämta productId från URL med useParams()
    //
    // Tips: useParams() returnerar ett objekt med alla route-parametrar
    // Vår route kommer vara: /butik/:productId
    // Så: const { productId } = useParams();
    //
    // Exempel: Om URL är /butik/keramik-vas-001
    // Då blir productId = "keramik-vas-001"

    const { productId } = null; // ÄNDRA DENNA RAD

    // TODO(human): Hitta produkten från data baserat på productId
    //
    // Tips: Använd getProductById(productId) från products.js
    // Den returnerar produkt-objektet eller undefined om produkten inte finns
    //
    // const product = getProductById(productId);

    const product = null; // ÄNDRA DENNA RAD

    // TODO(human): Hantera fallet när produkten inte finns
    //
    // Om product är null/undefined, visa ett felmeddelande
    // Använd conditional rendering (early return pattern)
    //
    // if (!product) {
    //     return (
    //         <main role="main" id="main-content">
    //             <PageSection background="white" spacing="default">
    //                 <div className="product-not-found">
    //                     <h1>Produkten hittades inte</h1>
    //                     <p>Den produkt du söker finns inte längre.</p>
    //                     <Link to="/butik">Tillbaka till butiken</Link>
    //                 </div>
    //             </PageSection>
    //         </main>
    //     );
    // }

    return (
        <main role="main" id="main-content">
            <PageSection background="white" spacing="default">

                {/* Breadcrumb navigation */}
                <nav className="breadcrumb" aria-label="breadcrumb">
                    <Link to="/">Hem</Link>
                    <span> / </span>
                    <Link to="/butik">Butik</Link>
                    <span> / </span>
                    <span aria-current="page">{product?.name || 'Produkt'}</span>
                </nav>

                <div className="product-detail">

                    {/* Bildgalleri */}
                    <div className="product-images">
                        {/* TODO(human): Visa produktens huvudbild
                         *
                         * Tips:
                         * - Använd product.images[0] för första bilden
                         * - alt-text: product.name
                         * - className: "main-image"
                         *
                         * Bonus: Om product.images har fler än 1 bild,
                         * visa thumbnails under huvudbilden som man kan klicka på
                         */}
                        <img
                            src={product?.images[0]}
                            alt={product?.name}
                            className="main-image"
                        />
                    </div>

                    {/* Produktinfo */}
                    <div className="product-info">
                        <h1>{product?.name}</h1>

                        <p className="artist">Av {product?.artist}</p>

                        <p className="price">{product && formatPrice(product.price)}</p>

                        <div className="description">
                            {/* TODO(human): Visa product.longDescription här
                             *
                             * Tips: longDescription är längre än description
                             * och ger mer detaljer om produkten
                             */}
                            <p>{product?.longDescription}</p>
                        </div>

                        {/* Lagerstatus */}
                        <div className="stock-status">
                            {/* TODO(human): Visa lagerstatus
                             *
                             * Tips: Conditional rendering baserat på product.stock
                             * - Om stock > 0: "I lager ({stock} st)"
                             * - Om stock === 0: "Slutsåld"
                             *
                             * Använd olika CSS-klasser för olika status
                             */}
                            {product && product.stock > 0 ? (
                                <span className="in-stock">I lager ({product.stock} st)</span>
                            ) : (
                                <span className="out-of-stock">Slutsåld</span>
                            )}
                        </div>

                        {/* Köp-sektion */}
                        <div className="purchase-section">
                            {/* TODO(human): Lägg till kvantitet-väljare
                             *
                             * Tips:
                             * - Input type="number" med min="1" max={product.stock}
                             * - Använd useState för att hålla vald kvantitet
                             * - Default value: 1
                             */}
                            <button
                                type="button"
                                className="add-to-cart-btn"
                                disabled={product && product.stock === 0}
                            >
                                {product && product.stock > 0 ? 'Lägg i varukorg' : 'Slutsåld'}
                            </button>
                        </div>

                        {/* Metadata */}
                        <div className="product-metadata">
                            <p><strong>Kategori:</strong> {product?.category}</p>
                            <p><strong>Produkt-ID:</strong> {product?.id}</p>
                        </div>

                    </div>
                </div>

                {/* Tillbaka-knapp */}
                <div className="back-to-shop">
                    <Link to="/butik" className="back-link">
                        ← Tillbaka till butiken
                    </Link>
                </div>

            </PageSection>
        </main>
    );
}

export default ProductDetailPage;
