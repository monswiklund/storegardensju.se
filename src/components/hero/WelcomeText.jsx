import "./WelcomeText.css";


function WelcomeText() {
  return (
    <div className="content-container">
        <div className="välkomst-text">
          <div className="services">
            {/*<h2>Vi Erbjuder</h2>
            <h3>Evenemang</h3>
            <p>
              Möteslokal för kalas, mat och fest!
            </p>
            <p>
              Gäster sittning: 4 - 140
            </p>
            <p>
              Gäster mingel: 150+

            </p>
            <h3>Keramik- och Målarkurser</h3>
            <p>
              Våra kurser leds av
              erfarna konstnärer och erbjuder en avslappnad och inspirerande
              miljö för att låta din kreativitet flöda.
            </p>
            <h3>Workshops</h3>
            <p>
              Vi har även workshops för drejning och i måleri. Boka med ditt
              företag, vänner, möhippa eller svensexa.
            </p>
            <h3>Utställningar</h3>
            <p>
              Vi erbjuder även utställningar i vår ladugård. Vill du ställa ut
              din konst eller ha din egen loppis? Kontakta oss för mer information.
            </p>*/}
          </div>
          {/*<hr />
            <h3>Vilka vi är</h3>
            <p>
              Vi är en familj som vuxit upp här sedan 1990-talet och har sedan dess drömt om att skapa en plats främst till oss själva som vi sedan kan dela med andra.
              Vi kombinerar olika kompetenser och erfarenheter - både formell utbildning och självlärt kunnande.
              Detta är en del av vår vardag och livstil - att arrangera och skapa hemma hos oss själva.
            </p>

            <h4>Ann Wiklund - Konstnär & Keramiker</h4>
            <p>
              Driver Ann Wiklund Studio med atelje och keramikbutik på Storegården 7.
              Håller kurser i teckning, måleri och keramik både i egen regi och för studieförbundet NBV.
              Erbjuder workshops, skapande skola och andra kreativa uppdrag.
              Medlem i Sjölundagruppen och konstnärskollektivet Alea.
            </p>
            <button
              className="read-more-button"
              onClick={() => {
                const element = document.getElementById('ann-card');
                if (element) {
                  const navbarHeight = 70;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - navbarHeight - 20;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              Läs mer om Ann
            </button>

            <h4>Carl Wiklund - Event & Restaurang</h4>
            <p>
              Driver CW Consulting & Event med fokus på eventplanering för företag och privatpersoner.
              DJ och uthyrning av ljud/ljusanläggning.
              Ansvarar för byggnation, 3D-ritning och all teknisk utrustning på Storegården 7.
            </p>
            <button
              className="read-more-button"
              onClick={() => {
                const element = document.getElementById('carl-card');
                if (element) {
                  const navbarHeight = 70;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - navbarHeight - 20;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              Läs mer om Carl
            </button>

            <h4>Lina Wiklund - Planering, Event & Design</h4>
            <p>
              3 års erfarenhet av bröllop och fester i Stockholm samt över 5 års erfarenhet från restaurang och bar.
              Arbetar med digital design och illustration - namnskyltar, menyer och annat tryckt material.
              Skapar minnesvärda upplevelser från idé till färdigt event.
            </p>
            <button
              className="read-more-button"
              onClick={() => {
                const element = document.getElementById('lina-card');
                if (element) {
                  const navbarHeight = 70;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - navbarHeight - 20;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              Läs mer om Lina
            </button>

            <h4>Måns Wiklund - Programmerare</h4>
            <p>
              Cloud Developer-student på YH Campus Mölndal.
              Utvecklar och underhåller hemsidan samt hjälper till med gårdens drift och underhåll.
            </p>
            <button
              className="read-more-button"
              onClick={() => {
                const element = document.getElementById('mans-card');
                if (element) {
                  const navbarHeight = 70;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - navbarHeight - 20;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
            >
              Läs mer om Måns
            </button>*/}

 {/*           <h3>Om platsen</h3>
            <p>
              Storegården 7 ligger bara 15 minuter utanför Lidköpings centrum i en lantlig omgivning,
              långt från stadens brus. En plats där dina gäster kan koppla av och uppleva något unikt.
              Vi har tagit vara på den gamla gårdens charm och kombinerat den med moderna bekvämligheter.
            </p>*/}

        </div>

        </div>
  );
}

export default WelcomeText;