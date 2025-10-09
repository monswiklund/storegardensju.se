import ParallaxHero from '../../features/events/ParallaxHero/ParallaxHero.jsx';
import './EventPage.css';
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
        <SendToGalleryButton />
    </main>
  );
}

export default EventPage;
