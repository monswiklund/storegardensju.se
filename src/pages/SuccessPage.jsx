import { useEffect, useContext, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../components";
import { verifySession } from "../services/stripeService";
import "./SuccessPage.css";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useContext(CartContext);
  const hasCleared = useRef(false);

  useEffect(() => {
    // Verifiera sessionen innan varukorgen töms
    const verifyAndClear = async () => {
      if (sessionId && !hasCleared.current) {
        // Enkel klient-side kontroll först för att undvika onödiga anrop
        if (sessionId === "undefined" || sessionId === "null") return;

        try {
          // Importera service dynamiskt eller lägg till import i toppen av filen
          // För nu antar vi att vi har lagt till importen
          const isValid = await verifySession(sessionId);

          if (isValid) {
            hasCleared.current = true;
            clearCart();
          } else {
            console.warn("Ogiltig session, tömmer ej varukorg");
            // Här kan man redirecta eller visa felmeddelande om man vill
            // Men vi låter användaren se sidan, bara inte tömma korgen
          }
        } catch (error) {
          console.error("Kunde inte verifiera session", error);
        }
      }
    };

    verifyAndClear();
  }, [sessionId, clearCart]);

  // Om ingen session_id finns, visa ett meddelande
  if (!sessionId) {
    return (
      <main role="main" id="main-content">
        <PageSection background="white" spacing="default">
          <div className="success-container">
            <h1>Ingen aktiv order</h1>
            <p className="success-message">
              Det verkar som att du inte har en aktiv orderbekräftelse.
            </p>
            <div className="success-actions">
              <Link to="/butik" className="btn-primary">
                <ShoppingBag size={18} />
                Gå till butiken
              </Link>
            </div>
          </div>
        </PageSection>
      </main>
    );
  }

  return (
    <main role="main" id="main-content">
      <PageSection background="white" spacing="default">
        <div className="success-container">
          <CheckCircle size={80} className="success-icon" />
          <h1>Tack för din beställning!</h1>
          <p className="success-message">
            Din betalning har genomförts och din order är bekräftad.
          </p>

          <div className="order-details">
            <p className="session-id">
              <strong>Order-ID:</strong>{" "}
              <span className="order-id-value">{sessionId}</span>
            </p>
            <p className="info-text">
              Spara detta ID om du behöver kontakta oss angående din order.
            </p>
            <p className="info-text">
              Vi återkommer med leveransbesked och uppdatering via e-post.
            </p>
          </div>

          <p className="contact-info">
            Har du frågor om din beställning? Kontakta oss på{" "}
            <a href="mailto:storegardensju@gmail.com">
              storegardensju@gmail.com
            </a>
          </p>

          <div className="success-actions">
            <Link to="/butik" className="btn-primary">
              <ShoppingBag size={18} />
              Fortsätt handla
            </Link>
            <Link to="/" className="btn-secondary">
              <Home size={18} />
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
