import welcomeImage from "../../assets/logoTransp.png";
import { useNavigate } from "react-router-dom";
import "./WelcomeImage.css";

function WelcomeImage() {
  const navigate = useNavigate();
  return (
    <div className="stor-logga-container">
      <div className="stor-logga">
        <img src={welcomeImage} alt="Lägg till Storegården 7 Loggan" />
      </div>
      <div className="titel">
        <h1>Välkommen till Storegården 7</h1>
        <h2>En plats för kreativt nöje!</h2>
        <p>
          En ständigt växande plats där tanken är att det ska finnas något för
          alla.
        </p>
        <p>Konstnärliga kurser i att måla och att skapa med keramik.</p>
        <p>
          Eller hyr vår fina lokal till att anordna kalas, bröllop, eller fest.
        </p>
        <p>
          Loppis har vi även emellanåt och det finns en gårdsbutik med konst,
          keramik och en atelje för inspiration.
        </p>

        <div className="hero-cta-group">
          <button
            className="hero-cta hero-cta-primary"
            onClick={() =>
              document
                .querySelector(".contact-container")
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            aria-label="Scrolla till kontakt-sektion"
          >
            Boka ditt evenemang
          </button>
          <div className="hero-cta-secondary-group">
            <button
              className="hero-cta hero-cta-secondary"
              onClick={() => navigate("/galleri")}
              aria-label="Gå till bildgalleri"
            >
              Se galleriet
            </button>
            <a
              href="https://maps.google.com/?q=Storegården+7+Rackeby+Lidköping"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta hero-cta-secondary"
              aria-label="Öppna Google Maps för vägbeskrivning"
            >
              Hitta hit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeImage;