import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { CartContext } from "../../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../../components";
import { formatPrice } from "../../data/products";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cart, getTotal } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Om varukorgen är tom, redirecta till butiken
  if (!cart || cart.length === 0) {
    return (
      <main role="main" id="main-content">
        <PageSection background="white" spacing="default">
          <div className="checkout-empty">
            <h1>Din varukorg är tom</h1>
            <p>Lägg till produkter innan du går till kassan</p>
            <Link to="/butik" className="btn-primary">
              Till butiken
            </Link>
          </div>
        </PageSection>
      </main>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";
      console.log("Calling API:", `${API_URL}/create-checkout-session`);
      console.log("Cart items:", cart);

      // Konvertera pris från SEK till öre (Stripe förväntar sig smallest currency unit)
      // Och säkerställ att bildvägar är absoluta URLs
      const cartItemsForStripe = cart.map((item) => ({
        ...item,
        price: item.price * 100, // 150 SEK -> 15000 öre
        images: item.images.map((img) =>
          img.startsWith("http") ? img : `${window.location.origin}${img}`
        ),
      }));

      console.log("Cart items for Stripe (prices in öre):", cartItemsForStripe);

      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItemsForStripe }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (!data.url) {
        throw new Error("No checkout URL received from backend");
      }

      // Redirecta till Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        `Fel: ${err.message}. Kontrollera att backend körs på http://localhost:4242`
      );
      setLoading(false);
    }
  };

  const subtotal = getTotal();
  // Fraktlogik: Fri frakt över 500 kr, annars 49 kr (eller hämta i butik gratis)
  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 49;
  const shippingEstimate =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingEstimate;

  return (
    <main role="main" id="main-content">
      <PageSection background="white" spacing="default">
        <div className="checkout-container">
          <div className="checkout-header">
            <button
              onClick={() => navigate("/varukorg")}
              className="back-button"
              aria-label="Tillbaka till varukorgen"
            >
              <ArrowLeft size={20} />
              Tillbaka till varukorgen
            </button>
            <h1>Kassa</h1>
          </div>

          <div className="checkout-content">
            {/* Order Summary */}
            <div className="order-summary">
              <h2>Ordersammanfattning</h2>

              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="order-item-image"
                    />
                    <div className="order-item-details">
                      <h3>{item.name}</h3>
                      <p className="order-item-quantity">
                        Antal: {item.quantity}
                      </p>
                    </div>
                    <div className="order-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Delsumma:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="order-total-row">
                  <span>Frakt:</span>
                  <span>
                    {shippingEstimate === 0
                      ? "Fri frakt!"
                      : `från ${formatPrice(shippingEstimate)}`}
                  </span>
                </div>
                {shippingEstimate > 0 && (
                  <p className="shipping-note">
                    Fri frakt vid köp över{" "}
                    {formatPrice(FREE_SHIPPING_THRESHOLD)} • Hämta i butik
                    alltid gratis
                  </p>
                )}
                <div className="order-total-row order-total-final">
                  <span>Totalt:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="payment-section">
              <div className="payment-info">
                <Lock size={24} />
                <div>
                  <h3>Säker betalning</h3>
                  <p>Din betalning hanteras säkert av Stripe</p>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="checkout-button"
              >
                {loading ? "Laddar..." : "Gå till betalning"}
              </button>

              <p className="payment-disclaimer">
                Du kommer att omdirigeras till Stripe för att slutföra
                betalningen
              </p>
            </div>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
