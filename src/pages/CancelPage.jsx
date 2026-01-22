import { Link } from "react-router-dom";
import { XCircle, ShoppingCart } from "lucide-react";
import { PageSection } from "../components";
import "./CancelPage.css";

export default function CancelPage() {
  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="cancel-container">
          <XCircle size={80} className="cancel-icon" />
          <h1>Betalning avbruten</h1>
          <p className="cancel-message">
            Din betalning har avbrutits och ingen debitering har gjorts.
          </p>
          <p className="reassurance">
            Inga problem! Dina produkter finns kvar i varukorgen.
          </p>

          <div className="cancel-actions">
            <Link to="/varukorg" className="btn-primary">
              <ShoppingCart size={20} />
              Tillbaka till varukorgen
            </Link>
            <Link to="/butik" className="btn-secondary">
              Fortsätt handla
            </Link>
          </div>

          <div className="help-section">
            <p>Behöver du hjälp eller har du frågor?</p>
            <p>
              Kontakta oss på{" "}
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
