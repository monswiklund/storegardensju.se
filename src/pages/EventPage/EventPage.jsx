import { useEffect, useState } from "react";
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
  const [activeSection, setActiveSection] = useState("top");

  const handleGalleryClick = () => {
    navigate("/galleri");
  };

  // Scroll spy listener to update floating navigation dots based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      const introSection = document.getElementById("event-intro-section");
      const loftSection = document.getElementById("event-loft-section");
      const amenitiesSection = document.getElementById("event-amenities-section");
      const detailsSection = document.getElementById("event-details-section");
      const contactSection = document.querySelector(".contact-container");

      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;

      if (contactSection && scrollPosition >= getAbsTop(contactSection)) {
        setActiveSection("contact");
      } else if (detailsSection && scrollPosition >= getAbsTop(detailsSection)) {
        setActiveSection("details");
      } else if (amenitiesSection && scrollPosition >= getAbsTop(amenitiesSection)) {
        setActiveSection("amenities");
      } else if (loftSection && scrollPosition >= getAbsTop(loftSection)) {
        setActiveSection("loft");
      } else {
        setActiveSection("top");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger once on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    let element = document.getElementById(id);
    if (!element && id === "event-contact") {
      element = document.querySelector(".contact-container");
    }
    if (element) {
      const yOffset = -70; // offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="event-page-container">
      {/* Floating Scroll Indicator Dot Navigation (Scroll Spy) */}
      <nav className="scroll-indicator-nav" aria-label="Sidinnehåll">
        <ul>
          <li>
            <button
              onClick={() => scrollToSection("event-intro-section")}
              className={`scroll-dot ${activeSection === "top" ? "active" : ""}`}
              title="Bröllop & Fest"
            >
              <span className="dot-label">Start</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("event-loft-section")}
              className={`scroll-dot ${activeSection === "loft" ? "active" : ""}`}
              title="Kapacitet"
            >
              <span className="dot-label">Kapacitet</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("event-amenities-section")}
              className={`scroll-dot ${activeSection === "amenities" ? "active" : ""}`}
              title="Möjligheter"
            >
              <span className="dot-label">Möjligheter</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("event-details-section")}
              className={`scroll-dot ${activeSection === "details" ? "active" : ""}`}
              title="Lokaldetaljer"
            >
              <span className="dot-label">Detaljer & Fakta</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("event-contact")}
              className={`scroll-dot ${activeSection === "contact" ? "active" : ""}`}
              title="Hitta hit & kontakt"
            >
              <span className="dot-label">Kontakt</span>
            </button>
          </li>
        </ul>
      </nav>

      <main role="main" id="main-content" className="event-page">
        {/* Hero Section med Parallax */}
        <section id="event-intro-section" className="event-story-section">
          <ParallaxHero
            image="/images/event/hero/hero.webp"
            title="Bröllop, Event & Fest"
            subtitle=""
            zIndex={1}
            delayScrollCue={true}
          >
            <div id="scroll-target" />
          </ParallaxHero>
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
        
        <section id="event-details-section" className="event-hero-description">
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
    </div>
  );
}

export default EventPage;
