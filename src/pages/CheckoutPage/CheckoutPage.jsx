import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { CartContext } from "../../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../../components";
import { formatPrice } from "../../data/products";
import { getApiBaseUrl } from "../../config/apiBaseUrl";
import { useSiteCopy } from "../../hooks/usePageCopy";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const API_URL = getApiBaseUrl();
  const { cart, getTotal } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const siteCopy = useSiteCopy();

  // Om varukorgen är tom, redirecta till butiken
  if (!cart || cart.length === 0) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="checkout-empty">
            <h1>{siteCopy("cart.empty-message")}</h1>
            <p>{siteCopy("checkout.empty-cart-warning")}</p>
            <Link to="/butik/" className="btn-primary">
              {siteCopy("cart.continue-shopping")}
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
      const cartItemsForStripe = cart.map((item) => ({
        id: item.id,
        priceId: item.priceId,
        name: item.name,
        price: item.price * 100,
        quantity: item.quantity,
        images: item.images.map((img) =>
          img.startsWith("http") ? img : `${window.location.origin}${img}`
        ),
      }));

      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItemsForStripe }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error("No checkout URL received from backend");
      }

      if (data.sessionId && data.verifyToken) {
        sessionStorage.setItem(
          `checkout_verify_token:${data.sessionId}`,
          data.verifyToken
        );
      }

      // Redirecta till Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(siteCopy("ui.error"));
      setLoading(false);
    }
  };

  const subtotal = getTotal();
  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 49;
  const shippingEstimate =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingEstimate;

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="checkout-container">
          <div className="checkout-header">
            <button
              onClick={() => navigate("/varukorg")}
              className="back-button"
              aria-label={siteCopy("ui.back")}
            >
              <ArrowLeft size={20} />
              {siteCopy("ui.back")}
            </button>
            <h1>{siteCopy("checkout.page-title")}</h1>
          </div>

          <div className="checkout-content">
            {/* Order Summary */}
            <div className="order-summary">
              <h2>{siteCopy("checkout.order-summary")}</h2>

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
                        {siteCopy("cart.quantity-label")} {item.quantity}
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
                  <span>{siteCopy("cart.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="order-total-row order-total-final">
                  <span>{siteCopy("cart.total")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="payment-section">
              <div className="payment-info">
                <Lock size={24} />
                <div>
                  <h3>{siteCopy("checkout.payment-method")}</h3>
                  <p>{siteCopy("checkout.stripe-notice")}</p>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="checkout-button"
              >
                {loading ? siteCopy("checkout.processing") : siteCopy("checkout.pay-button")}
              </button>

              <p className="payment-disclaimer">
                {siteCopy("checkout.terms-notice")}
              </p>
            </div>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
