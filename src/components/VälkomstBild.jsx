import välkomstBild from "../assets/logoTransp.png";

function VälkomstBild() {
  return (
    <div className="stor-logga-container">
      <div className="stor-logga">
        <img src={välkomstBild} alt="Lägg till Storegården 7 Loggan" />
      </div>
      <div className="titel">
          <h1>Välkommen till Storegården 7</h1>
        <h2>En plats för kreativt nöje!</h2>
              <p>
                  En ständigt växande plats där tanken är att det ska finnas något
                  för alla.
              </p>
              <p>Konstnärliga kurser i att måla och att skapa med keramik.</p>
              <p>Eller hyr vår fina lokal till att anordna kalas, bröllop, eller fest.</p>
              <p>
                  Loppis har vi även emellanåt och det finns en gårdsbutik med konst, keramik och en atelje för inspiration.
              </p>

        <div className="hero-cta-group">
          <button
            className="hero-cta hero-cta-primary"
            onClick={() => document.querySelector('.kontakt-container')?.scrollIntoView({behavior: 'smooth', block: 'center'})}
            aria-label="Scrolla till kontakt-sektion"
          >
            Boka ditt evenemang
          </button>
          <button
            className="hero-cta hero-cta-secondary"
            onClick={() => document.querySelector('.storegarden-gallery')?.scrollIntoView({behavior: 'smooth', block: 'start'})}
            aria-label="Scrolla till bildgalleri"
          >
            Se galleriet
          </button>
        </div>
      </div>
    </div>
  );
}

export default VälkomstBild;
