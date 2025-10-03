import { useState, useEffect, useRef } from 'react';
import ParallaxHero from '../components/ParallaxHero';
import StickyImageSection from '../components/StickyImageSection';
import EventFest from '../components/EventFest';
import '../components/EventPageStyles.css';

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

      {/* Sticky Image Section 1: Lokalen */}
      <StickyImageSection
          image="/images/event/hero/hero-2.webp"
        imageAlt="Storegården 7 lokal interiör"
        imageSide="left"
        backgroundColor="var(--background-alt)"
      >
        <div className="lokalen-content event-story-section">
          <h2>En lokal med karaktär</h2>
          <p>
            Storegården 7 är en flexibel eventlokal i hjärtat av bygden. Med sitt unika loft
            och rustika charm erbjuder vi den perfekta miljön för ditt nästa evenemang.
          </p>
          <p>
            Vår lokal rymmer 10-140 gäster beroende på typ av arrangemang och kan anpassas
            efter dina önskemål. Vi hjälper dig att skapa det perfekta evenemanget.
          </p>

          <h3>Vad vi erbjuder</h3>
          <ul className="lokalen-features">
            <li>Flexibel lokal för 10-140 personer</li>
            <li>Ljud- och ljussystem</li>
            <li>Rustik och modern inredning</li>
            <li>Fullt utrustat kök</li>
            <li>Parkeringsmöjligheter</li>
            <li>Centralt läge</li>
          </ul>
        </div>
      </StickyImageSection>

      {/* Sticky Image Section 2: Utrymmet */}
      <StickyImageSection
        image="/images/lokal/slide5.jpg"
        imageAlt="Storegården 7 utrymme"
        imageSide="right"
        backgroundColor="white"
      >
        <div className="lokalen-content event-story-section">
          <h2>Utrymme för alla tillfällen</h2>
          <p>
            Vårt unika loft skapar en atmosfär som är både intim och rymlig.
            Det höga taket med synliga takstolar ger en känsla av rymlighet
            samtidigt som den rustika charmen bibehålls.
          </p>
          <p>
            Lokalen kan enkelt anpassas för allt från workshops och mindre middagar
            till större fester och konferenser. Flexibiliteten är vår styrka.
          </p>
        </div>
      </StickyImageSection>

      {/* Sticky Image Section 3: Detaljer */}
      <StickyImageSection
        image="/images/lokal/slide7.jpg"
        imageAlt="Storegården 7 detaljer"
        imageSide="left"
        backgroundColor="var(--background-alt)"
      >
        <div className="lokalen-content event-story-section">
          <h2>Varje detalj räknas</h2>
          <p>
            Vi tror på att det är detaljerna som skapar upplevelsen. Från belysning
            till möblering - allt kan anpassas för att skapa rätt atmosfär för just
            ditt evenemang.
          </p>
          <p>
            Ljussystemet ger dig full kontroll över stämningen, från varmt och intimt
            till festligt och energiskt. Ljudsystemet ser till att alla hör - oavsett
            om det är tal, musik eller presentationer.
          </p>
        </div>
      </StickyImageSection>

      {/* Sticky Image Section 4: Möjligheter */}
      <StickyImageSection
        image="/images/lokal/slide9.jpg"
        imageAlt="Storegården 7 möjligheter"
        imageSide="right"
        backgroundColor="white"
      >
        <div className="lokalen-content event-story-section">
          <h2>Oändliga möjligheter</h2>
          <p>
            Från bröllop och jubileum till företagsevent och vernissage -
            Storegården 7 har varit scen för otaliga minnesrika stunder.
          </p>
          <p>
            Låt oss hjälpa dig skapa ditt nästa evenemang. Med vår erfarenhet
            och din vision blir resultatet något alldeles särskilt.
          </p>
        </div>
      </StickyImageSection>

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
