import ParallaxHero from "../../features/events/ParallaxHero/ParallaxHero.jsx";
import "./EventPage.css";
import { useNavigate } from "react-router-dom";

const eventFacts = [
  {
    value: "360 kvm",
    label: "Inomhusyta fördelad på två våningar, lada och loft.",
  },
  {
    value: "150+",
    label: "Sittande gäster på loftet, med plats för större mingel.",
  },
  {
    value: "Bar, kök",
    label: "Långbord, soffor, dansgolv, toaletter och förvaring intill.",
  },
  {
    value: "Personal",
    label: "Vi kan hjälpa till med servering, bar eller DJ vid behov.",
  },
];

function EventPage() {
  const navigate = useNavigate();

  const handleGalleryClick = () => {
    navigate("/galleri");
  };

  return (
    <main role="main" id="main-content" className="event-page">
      {/* Hero Section med Parallax */}
      <section id="event-intro-section" className="event-story-section">
        <ParallaxHero
          image="/images/event/hero/hero.webp"
          title="Bröllop, Event & Fest"
          subtitle=""
          zIndex={1}
          delayScrollCue={true}
        />
      </section>

      {/* Sticky Image Section 1 */}
      <section id="event-loft-section" className="event-story-section">
        <ParallaxHero
          image="/images/event/hero/hero-2.webp"
          title={`Loftet 150+ sittandes
Ladan 50+ sittandes
Mingel 300+`}
          subtitle=""
          zIndex={2}
        />
      </section>

      {/* Sticky Image Section 2 */}
      <section id="event-amenities-section" className="event-story-section">
        <ParallaxHero
          image="/images/event/hero/hero-3.webp"
          title="Vi har allt som behövs för ett lyckat event"
          subtitle="Läs mer nedan vad vi erbjuder"
          zIndex={3}
        />
      </section>
      <section className="event-hero-description">
        <div className="event-hero-description__content">
          <p className="event-hero-description__eyebrow">Eventlokal för stora och små sällskap</p>
          <h2>Bröllop, fest eller afterwork.</h2>
          <p className="event-hero-description__intro">
            Vår gård passar lika bra för ett stort firande som för ett mer
            personligt event. Här får ni en lokal med gott om yta, rätt
            utrustning och en miljö som känns varm direkt när gästerna kliver
            in.
          </p>

          <div
            className="event-hero-description__facts"
            aria-label="Snabba fakta om lokalen"
          >
            {eventFacts.map((fact) => (
              <article key={fact.value} className="event-fact-card">
                <strong>{fact.value}</strong>
                <p>{fact.label}</p>
              </article>
            ))}
          </div>

          <div className="event-hero-description__details">
            <p>
              Den nedre delen av ladan är vår umgängesyta. Där finns långbord,
              soffor, dansgolv, bar, kök samt ett förråd. Toaletter finns
              intill.
            </p>
            <p>
              Mat och dryck tar ni med själva. Vi har glas, tallrikar, bestick,
              bord, stolar, ljud och ljus på plats.
            </p>
          </div>

          <div className="event-hero-description__actions">
            <button
              className="event-gallery-button event-gallery-button--solid"
              type="button"
              onClick={handleGalleryClick}
              aria-label="Gå till bildgalleri"
            >
              Se galleriet
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default EventPage;
