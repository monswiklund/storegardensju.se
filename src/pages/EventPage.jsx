import { useState, useEffect, useRef } from 'react';
import ParallaxHero from '../components/hero/ParallaxHero/ParallaxHero';
import StickyImageSection from '../components/hero/StickyImageSection/StickyImageSection';
import EventFest from '../components/events/EventFest/EventFest';
import '../components/events/EventPageStyles.css';

function EventPage() {
  const [eventFestVisible, setEventFestVisible] = useState(false);
  const [gridItemsVisible, setGridItemsVisible] = useState(false);
  const eventFestRef = useRef(null);
  const eventsGridRef = useRef(null);

  // Intersection observer för EventFest section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEventFestVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (eventFestRef.current) {
      observer.observe(eventFestRef.current);
    }

    return () => {
      if (eventFestRef.current) {
        observer.unobserve(eventFestRef.current);
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

      {/* EventFest Section med scroll-triggered animation */}
      <div
        ref={eventFestRef}
        className={`event-fest-wrapper ${eventFestVisible ? 'is-visible' : ''}`}
      >
        <EventFest />
      </div>

      {/* Previous Events Grid */}
      <section className="previous-events-section">
        <div className="previous-events-container">
          <h2>Tidigare Evenemang</h2>
          <div ref={eventsGridRef} className="events-grid">
            {previousEvents.map((event, index) => (
              <div
                key={index}
                className={`event-grid-item ${gridItemsVisible ? 'is-visible' : ''}`}
              >
                <img src={event.image} alt={event.alt} loading="lazy" />
                <div className="event-grid-overlay" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="event-cta-section">
        <div className="event-cta-content">
          <h2>Redo att boka?</h2>
          <p>
            Kontakta oss för att diskutera ditt evenemang och få en offert anpassad efter
            dina behov.
          </p>
          <button
            className="cta-button"
            onClick={() =>
              document
                .querySelector('.kontakt-container')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          >
            Kontakta oss
          </button>
        </div>
      </section>
    </main>
  );
}

export default EventPage;
