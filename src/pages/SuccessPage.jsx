import { useEffect, useContext, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../components";
import { verifySession } from "../services/stripeService";
import { useSiteCopy } from "../hooks/usePageCopy";
import "./SuccessPage.css";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useContext(CartContext);
  const hasCleared = useRef(false);
  const siteCopy = useSiteCopy();

  useEffect(() => {
    // Verifiera sessionen innan varukorgen töms
    const verifyAndClear = async () => {
      if (sessionId && !hasCleared.current) {
        if (sessionId === "undefined" || sessionId === "null") return;

        try {
          const token = sessionStorage.getItem(
            `checkout_verify_token:${sessionId}`
          );
          const isValid = await verifySession(sessionId, token);

          if (isValid) {
            hasCleared.current = true;
            clearCart();
            if (token) {
              sessionStorage.removeItem(`checkout_verify_token:${sessionId}`);
            }
          } else {
            console.warn("Invalid session, cart not cleared");
          }
        } catch (error) {
          console.error("Failed to verify session", error);
        }
      }
    };

    verifyAndClear();
  }, [sessionId, clearCart]);

  // Om ingen session_id finns, visa ett meddelande
  if (!sessionId) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="success-container">
            <h1>{siteCopy("success.no-order-title")}</h1>
            <p className="success-message">
              {siteCopy("success.no-order-lead")}
            </p>
            <div className="success-actions">
              <Link to="/butik/" className="btn-primary">
                <ShoppingBag size={18} />
                {siteCopy("cart.continue-shopping")}
              </Link>
            </div>
          </div>
        </PageSection>
      </main>
    );
  }

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="success-container">
          <CheckCircle size={80} className="success-icon" />
          <h1>{siteCopy("success.title")}</h1>
          <p className="success-message">
            {siteCopy("success.lead")}
          </p>

          <div className="order-details">
            <p className="session-id">
              <strong>{siteCopy("success.order-id-label")}</strong>{" "}
              <span className="order-id-value">{sessionId}</span>
            </p>
            <p className="info-text">
              {siteCopy("success.order-id-hint")}
            </p>
            <p className="info-text">
              {siteCopy("success.email-hint")}
            </p>
          </div>

          <p className="contact-info">
            {siteCopy("success.contact-hint")}{" "}
            <a href="mailto:storegardensju@gmail.com">
              storegardensju@gmail.com
            </a>
          </p>

          <div className="success-actions">
            <Link to="/butik/" className="btn-primary">
              <ShoppingBag size={18} />
              {siteCopy("cart.continue-shopping")}
            </Link>
            <Link to="/" className="btn-secondary">
              <Home size={18} />
              {siteCopy("nav.home")}
            </Link>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
