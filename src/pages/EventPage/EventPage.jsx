import { useState, useEffect, useRef } from 'react';
import ParallaxHero from '../../features/events/ParallaxHero/ParallaxHero';
import EventParty from '../../features/events/EventParty/EventParty';
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
  const [eventPartyVisible, setEventPartyVisible] = useState(false);
  const eventPartyRef = useRef(null);

  // Intersection observer för EventParty section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEventPartyVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const currentRef = eventPartyRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

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
Ladan 500+ sittandes
Mingel 300+`}
        subtitle=""
        zIndex={2}
      />

     {/* Sticky Image Section 2 */}
        <ParallaxHero
            image="/images/event/hero/hero-3.webp"
            title="Vi har allt som behövs för ett lyckat event"
            subtitle="Läs mer nedan med vad vi erbjuder"
            zIndex={3}
        />
        <SendToGalleryButton />
        {/*<EventParty /> */}
    </main>
  );
}

export default EventPage;
