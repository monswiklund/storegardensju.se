import { useState, useEffect, useRef } from 'react';
import ParallaxHero from '../components/hero/ParallaxHero/ParallaxHero';
import StickyImageSection from '../components/hero/StickyImageSection/StickyImageSection';
import EventParty from '../components/events/EventParty/EventParty';
import '../components/events/EventPageStyles.css';

function EventPage() {
  const [eventPartyVisible, setEventPartyVisible] = useState(false);
  const [gridItemsVisible, setGridItemsVisible] = useState(false);
  const eventPartyRef = useRef(null);
  const eventsGridRef = useRef(null);

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

    if (eventPartyRef.current) {
      observer.observe(eventPartyRef.current);
    }

    return () => {
      if (eventPartyRef.current) {
        observer.unobserve(eventPartyRef.current);
      }
    };
  }, []);

  // Intersection observer för events grid
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridItemsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (eventsGridRef.current) {
      observer.observe(eventsGridRef.current);
    }

    return () => {
      if (eventsGridRef.current) {
        observer.unobserve(eventsGridRef.current);
      }
    };
  }, []);

  const previousEvents = [
    { image: '/images/evenemang/slide2.jpg', alt: 'Event 1' },
    { image: '/images/evenemang/slide4.jpg', alt: 'Event 2' },
    { image: '/images/evenemang/slide6.jpg', alt: 'Event 3' },
    { image: '/images/evenemang/slide8.jpg', alt: 'Event 4' },
    { image: '/images/evenemang/slide10.jpg', alt: 'Event 5' },
    { image: '/images/evenemang/slide12.jpg', alt: 'Event 6' },
  ];

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
