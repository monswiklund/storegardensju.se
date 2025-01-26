// eslint-disable-next-line no-unused-vars
import React from "react";
import FadeInSection from "./FadeInSection.jsx";

function Tjänster() {
  return (
    <FadeInSection>
      <div className="tjänster">
        <h3>Vi Erbjuder</h3>
        <FadeInSection>
          <h4>Evenemang</h4>
          <p>
            Söker du den perfekta platsen för ditt bröllop eller
            företagsevenemang? Vår ladugård erbjuder en rustik och romantisk
            atmosfär som kommer att förtrolla dina gäster.
          </p>
        </FadeInSection>
        <FadeInSection>
          <h4>Keramik- och Målarkurser</h4>
          <p>
            För de kreativa själarna där ute är vår ladugård det ultimata
            utrymmet att utforska konsten att skapa. Våra kurser leds av erfarna
            konstnärer och erbjuder en avslappnad och inspirerande miljö för att
            låta din kreativitet flöda.
          </p>
        </FadeInSection>
        <FadeInSection>
          <h4>Utställningar</h4>
          <p>
            Vi är stolta över att vara en plattform för lokala konstnärer och
            hantverkare att visa upp sina verk. Kom och utforska våra
            utställningar och låt dig inspireras av den lokala konstnärliga
            talangen.
          </p>
        </FadeInSection>
      </div>
    </FadeInSection>
  );
}

export default Tjänster;
