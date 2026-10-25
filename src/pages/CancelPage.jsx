import { useContext } from "react";
import { Link } from "react-router-dom";
import { XCircle, ShoppingCart } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../components";
import { contactEmail } from "../features/contact/contact.js";
import { useSiteCopy } from "../hooks/usePageCopy";
import "./CancelPage.css";

export default function CancelPage() {
  const siteCopy = useSiteCopy();
  const { cart } = useContext(CartContext);
  // Stripe sends people back here with their cart untouched; say so and lead back to it only
  // when there is something in it.
  const hasItems = cart.length > 0;

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="cancel-container">
          <XCircle size={80} className="cancel-icon" aria-hidden="true" />
          <h1>{siteCopy("cancel.title")}</h1>
          <p className="cancel-message">
            {siteCopy("cancel.lead")}
          </p>
          {hasItems && (
            <p className="reassurance">
              {siteCopy("cancel.reassurance")}
            </p>
          )}

          <div className="cancel-actions">
            {hasItems && (
              <Link to="/varukorg/" className="btn btn--primary">
                <ShoppingCart size={20} aria-hidden="true" />
                {siteCopy("cancel.cart-cta")}
              </Link>
            )}
            <Link to="/butik/" className={`btn ${hasItems ? "btn--secondary" : "btn--primary"}`}>
              {siteCopy("cart.continue-shopping")}
            </Link>
          </div>

          <div className="help-section">
            <p>{siteCopy("cancel.help-title")}</p>
            <p>
              {siteCopy("cancel.help-lead")}{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
