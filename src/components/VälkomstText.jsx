// eslint-disable-next-line no-unused-vars
import React from "react";
import FadeInSection from "./FadeInSection.jsx";
import FadeInSectionOnScroll from "./FadeInSectionOnScroll.jsx";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";
import slide4 from "../assets/slide4.jpg";
import slide5 from "../assets/slide5.jpg";

function VälkomstText() {
  return (
    <div className="content-container">
      <FadeInSectionOnScroll>
        <div className="välkomst-text">
          <h2>Välkommen&nbsp;till Storegården 7</h2>
          <FadeInSection>
            <p>
              En ständigt växande plats där tanken är att det ska finnas något
              för alla.
            </p>
          </FadeInSection>
          <FadeInSection>
            <p>Konstnärliga kurser i att måla och att skapa med keramik.</p>
            <p>Eller hyr vår fina lokal till att anordna kalas, bröllop, eller fest.</p>
          </FadeInSection>
          <FadeInSection>
            <p>
              Loppis har vi även emellanåt och det finns en gårdsbutik med konst, keramik och en atelje för inspiration.
            </p>
          </FadeInSection>
          <br/>
          <hr />
          <FadeInSection>
            <h3>Varför välja oss?</h3>
            <h4>Unik plats</h4>
            <p>Vår ladugård är fylld med karaktär och charm, vilket ger dina evenemang en unik touch.</p>
            <h4>Flexibilitet</h4>
            <p>Vi är här för att hjälpa dig att skapa det perfekta evenemanget enligt dina önskemål och behov.</p>
            <h4>Professionell service</h4>
            <p>Vårt team av erfarna evenemangsplanerare och konstnärer finns här för att se till att din upplevelse är oförglömlig.</p>
            <p>Kontakta oss idag för att boka din nästa speciella händelse eller kurs i vår fantastiska ladugård!</p>
          </FadeInSection>
        </div>
      </FadeInSectionOnScroll>

      <FadeInSectionOnScroll>
        <div className="tjänster">
          <hr />
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
              utrymmet att utforska konsten att skapa. Våra kurser leds av
              erfarna konstnärer och erbjuder en avslappnad och inspirerande
              miljö för att låta din kreativitet flöda.
            </p>
          </FadeInSection>
          <FadeInSection>
            <h4>Workshops</h4>
            <p>
              Vi har även workshops för drejning och i måleri. Boka med ditt
              företag, vänner, möhippa eller svensexa.
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
      </FadeInSectionOnScroll>
    </div>
  );
}

export default VälkomstText;
