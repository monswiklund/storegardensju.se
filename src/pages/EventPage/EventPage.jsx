import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageSection } from "../../components";
import FadeInSection from "../../components/ui/FadeInSection.jsx";
import "./EventPage.css";

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

      const detailsSection = document.getElementById("event-details-section");
      const loftSection = document.getElementById("event-loft-section");
      const amenitiesSection = document.getElementById("event-amenities-section");
      const contactSection = document.querySelector(".contact-container");

      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;

      if (contactSection && scrollPosition >= getAbsTop(contactSection)) {
        setActiveSection("contact");
      } else if (amenitiesSection && scrollPosition >= getAbsTop(amenitiesSection)) {
        setActiveSection("amenities");
      } else if (loftSection && scrollPosition >= getAbsTop(loftSection)) {
        setActiveSection("loft");
      } else if (detailsSection && scrollPosition >= getAbsTop(detailsSection)) {
        setActiveSection("details");
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
              onClick={() => scrollToSection("event-hero")}
              className={`scroll-dot ${activeSection === "top" ? "active" : ""}`}
              title="Start"
            >
              <span className="dot-label">Start</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("event-details-section")}
              className={`scroll-dot ${activeSection === "details" ? "active" : ""}`}
              title="Bröllop & Fest"
            >
              <span className="dot-label">Bröllop & Fest</span>
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
              onClick={() => scrollToSection("event-contact")}
              className={`scroll-dot ${activeSection === "contact" ? "active" : ""}`}
              title="Kontakt"
            >
              <span className="dot-label">Kontakt</span>
            </button>
          </li>
        </ul>
      </nav>

      <main role="main" id="main-content" className="event-page">
        {/* Hero Section */}
        <section
          id="event-hero"
          className="event-hero"
          style={{ backgroundImage: "url('/images/event/hero/hero.webp')" }}
          aria-labelledby="event-heading"
        >
          <div className="event-hero__inner">
            <span className="event-eyebrow">Eventlokal på landet</span>
            <h1 id="event-heading">Bröllop, Event & Fest</h1>
            <p>Skapa minnesvärda stunder på vackra Storegården 7</p>
          </div>
        </section>

        {/* Detaljer & Fakta Sektion */}
        <div id="event-details-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="event-section-intro">
                <span className="event-section-eyebrow">Unik lokal för alla tillfällen</span>
                <h2>Bröllop, fest eller afterwork</h2>
                <p className="event-section-lead">
                  Vår gård passar lika bra för ett stort firande som för ett mer
                  personligt event. Här får ni en lokal med gott om yta, rätt
                  utrustning och en stämningsfull miljö som känns varm direkt när gästerna kliver in.
                </p>
              </div>

              <div className="event-facts-grid">
                {eventFacts.map((fact, index) => (
                  <article key={index} className="event-fact-card">
                    <strong>{fact.value}</strong>
                    <p>{fact.label}</p>
                  </article>
                ))}
              </div>

              <div className="event-action-bar">
                <button
                  className="event-gallery-button event-gallery-button--solid"
                  type="button"
                  onClick={handleGalleryClick}
                  aria-label="Gå till bildgalleri"
                >
                  Se galleriet
                </button>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        {/* Sektion: Ytor & Kapacitet (Alternativ A - hero-2.webp) */}
        <div id="event-loft-section">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="event-split-layout">
                <div className="event-split-image">
                  <img src="/images/event/hero/hero-2.webp" alt="Dukade bord för fest på loftet" />
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">Ytor & Kapacitet</span>
                  <h2>Stora sällskap eller mindre sammankomster</h2>
                  <p>
                    Med totalt 360 kvm inomhusyta fördelat på två våningar i vår omsorgsfullt renoverade lada
                    har ni all flexibilitet ni behöver för ert arrangemang. 
                  </p>
                  <ul className="event-bullets">
                    <li><strong>Loftet:</strong> Plats för 150+ sittande gäster – idealiskt för bröllopsmiddagar, festmåltider eller föreläsningar.</li>
                    <li><strong>Ladan:</strong> Plats för 50+ sittande gäster – en rustik och intim miljö på bottenvåningen.</li>
                    <li><strong>Mingel:</strong> Lokalen rymmer totalt 300+ gäster för stående tillställningar och festmingel.</li>
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        {/* Sektion: Möjligheter & Utrustning (Alternativ A - hero-3.webp) */}
        <div id="event-amenities-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="event-split-layout event-split-layout--reverse">
                <div className="event-split-image">
                  <img src="/images/event/hero/hero-3.webp" alt="Detaljbild från baren i ladan" />
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">Allt är förberett</span>
                  <h2>Vi har allt som behövs för ett lyckat event</h2>
                  <p>
                    Vi vill göra det så enkelt och bekymmersfritt som möjligt för er att arrangera er fest. 
                    Därför ingår allt det praktiska ni behöver i hyran.
                  </p>
                  <ul className="event-bullets">
                    <li><strong>Dukning & möbler:</strong> Glas, tallrikar, bestick, bord och stolar finns färdigt för alla gäster.</li>
                    <li><strong>Bekvämligheter:</strong> Mysig lounge med soffor, dansgolv, bar samt ett utrustat kök och toaletter i anslutning.</li>
                    <li><strong>Ljud & Ljus:</strong> Professionell ljudanläggning och festbelysning är installerat och klart att använda.</li>
                    <li><strong>Egen dryck & mat:</strong> Ni har full frihet att ta med egen mat och dryck. Vi hjälper gärna till att boka serveringspersonal, bar eller DJ om så önskas.</li>
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>
      </main>
    </div>
  );
}

export default EventPage;
