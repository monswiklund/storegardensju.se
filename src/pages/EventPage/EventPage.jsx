import { useState, useEffect, useRef } from 'react';
import ParallaxHero from '../../components/events/ParallaxHero/ParallaxHero';
import StickyImageSection from '../../components/home/StickyImageSection/StickyImageSection';
import EventParty from '../../components/events/EventParty/EventParty';
import './EventPage.css';

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
        title="Event på Storegården 7"
        subtitle=""
      />

      {/* Sticky Image Section 1 */}
      <StickyImageSection
        image="/images/event/hero/hero-2.webp"
        imageAlt="Storegården 7 lokal interiör"
      />

      {/* Sticky Image Section 2 */}
      <StickyImageSection
        image="/images/lokal/slide5.jpg"
        imageAlt="Storegården 7 utrymme"
      />

      {/* Sticky Image Section 3 */}
      <StickyImageSection
        image="/images/lokal/slide7.jpg"
        imageAlt="Storegården 7 detaljer"
      />

      {/* Sticky Image Section 4 */}
      <StickyImageSection
        image="/images/lokal/slide9.jpg"
        imageAlt="Storegården 7 möjligheter"
      />

      {/* EventParty Section med scroll-triggered animation */}
      <div
        ref={eventPartyRef}
        className={`event-party-wrapper ${eventPartyVisible ? 'is-visible' : ''}`}
      >
        <EventParty />
      </div>
    </main>
  );
}

export default EventPage;
