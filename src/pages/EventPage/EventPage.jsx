import { useState, useEffect, useRef } from 'react';
import ParallaxHero from '../../components/events/ParallaxHero/ParallaxHero';
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
        zIndex={1}
      />

      {/* Sticky Image Section 1 */}
      <ParallaxHero
        image="/images/event/hero/hero-2.webp"
        zIndex={2}
      />

      {/* Sticky Image Section 2 */}
      <ParallaxHero
        image="/images/event/hero/hero-3.webp"
        zIndex={3}
      />

        <EventParty />
    </main>
  );
}

export default EventPage;
