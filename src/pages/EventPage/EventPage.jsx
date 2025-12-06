import ParallaxHero from "../../features/events/ParallaxHero/ParallaxHero.jsx";
import "./EventPage.css";
import { useNavigate } from "react-router-dom";

function SendToGalleryButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/galleri");
  };

  return (
    <div className="event-gallery-button-container">
      <button
        className="event-gallery-button"
        onClick={handleClick}
        aria-label="Gå till bildgalleri"
      >
        Se galleriet
      </button>
    </div>
  );
}

function EventPage() {
  return (
    <main role="main" id="main-content" className="event-page">
      {/* Hero Section med Parallax */}
      <ParallaxHero
        image="/images/event/hero/hero.webp"
        title="Bröllop, Event & Fest"
        subtitle=""
        zIndex={1}
        delayScrollCue={true}
      />

      {/* Sticky Image Section 1 */}
      <ParallaxHero
        image="/images/event/hero/hero-2.webp"
        title={`Loftet 150+ sittandes
Ladan 50+ sittandes
Mingel 300+`}
        subtitle=""
        zIndex={2}
      />

      {/* Sticky Image Section 2 */}
      <ParallaxHero
        image="/images/event/hero/hero-3.webp"
        title="Vi har allt som behövs för ett lyckat event"
        subtitle="Läs mer nedan vad vi erbjuder"
        zIndex={3}
      />
      <section className="event-hero-description">
        <div className="event-hero-description__content">
          <p>
            Vare sig om det är ett bröllop, 50 års fest eller en afterwork så
            passar våran gård er!
          </p>
          <p>
            Våran lokal består av ca 360 kvadratmeter inomhus fördelat på två
            våningar, lada och loft.
          </p>
          <p>
            På loftet kan man sitta över 150 gäster om så önskas, men det passar
            även fint till de mindre sällskapen.
          </p>
          <p>
            Den nedre delen av ladan är våran umgängesyta. Där finns långbord,
            soffor, dansgolv, bar, kök samt ett förråd. Toaletter finns intill.
          </p>
          <p>
            Hos oss hittar ni allt ni kan tänkas behöva för ett event. Mat och
            dryck tar ni med själva.
          </p>
          <p>
            Vi har utrustning som glas, tallrikar, bestick, bord, stolar, ljud
            och ljus mm.
          </p>
          <p>
            Vi kan även erbjuda erfaren personal som arbetar med servering, bar
            eller dj.
          </p>
          <p>
            Kontakta oss så hjälper vi gärna till om ni har några funderingar.
          </p>
        </div>
      </section>
      <SendToGalleryButton />
    </main>
  );
}

export default EventPage;
