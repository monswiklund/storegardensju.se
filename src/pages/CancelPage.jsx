import { Link } from "react-router-dom";
import { XCircle, ShoppingCart } from "lucide-react";
import { PageSection } from "../components";
import { useSiteCopy } from "../hooks/usePageCopy";
import "./CancelPage.css";

export default function CancelPage() {
  const siteCopy = useSiteCopy();

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="cancel-container">
          <XCircle size={80} className="cancel-icon" />
          <h1>{siteCopy("cancel.title")}</h1>
          <p className="cancel-message">
            {siteCopy("cancel.lead")}
          </p>
          <p className="reassurance">
            {siteCopy("cancel.reassurance")}
          </p>

          <div className="cancel-actions">
            <Link to="/varukorg" className="btn-primary">
              <ShoppingCart size={20} />
              {siteCopy("ui.back")}
            </Link>
            <Link to="/butik/" className="btn-secondary">
              {siteCopy("cart.continue-shopping")}
            </Link>
          </div>

          <div className="help-section">
            <p>{siteCopy("cancel.help-title")}</p>
            <p>
              {siteCopy("cancel.help-lead")}{" "}
              <a href="mailto:storegardensju@gmail.com">
                storegardensju@gmail.com
              </a>
            </p>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
