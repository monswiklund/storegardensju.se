import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeHeroSection,
  HomeServicesSection,
  HomeUpcomingEventsSection,
} from "../features/home";
import { PageSection } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import VenueIntroSection from "../features/venue/VenueIntro/VenueIntroSection.jsx";

function HomePage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("top");

  const scrollToGallery = () => {
    navigate("/galleri");
  };

  // Scroll spy listener to update floating navigation dots based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      const heroSection = document.getElementById("home-hero");
      const welcomeSection = document.getElementById("home-welcome");
      const eventsSection = document.getElementById("home-events");
      const pastSection = document.getElementById("past-events");
      const servicesSection = document.getElementById("home-services");
      const contactSection = document.querySelector(".contact-container");

      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;

      if (contactSection && scrollPosition >= getAbsTop(contactSection)) {
        setActiveSection("contact");
      } else if (servicesSection && scrollPosition >= getAbsTop(servicesSection)) {
        setActiveSection("services");
      } else if (pastSection && scrollPosition >= getAbsTop(pastSection)) {
        setActiveSection("past");
      } else if (eventsSection && scrollPosition >= getAbsTop(eventsSection)) {
        setActiveSection("events");
      } else if (welcomeSection && scrollPosition >= getAbsTop(welcomeSection)) {
        setActiveSection("welcome");
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
    if (!element && id === "home-contact") {
      element = document.querySelector(".contact-container");
    }
    if (element) {
      const yOffset = -70; // offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="home-page">
      {/* Floating Scroll Indicator Dot Navigation (Scroll Spy) */}
      <nav className="scroll-indicator-nav" aria-label="Sidinnehåll">
        <ul>
          <li>
            <button
              onClick={() => scrollToSection("home-hero")}
              className={`scroll-dot ${activeSection === "top" ? "active" : ""}`}
              title="Till toppen"
            >
              <span className="dot-label">Start</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("home-welcome")}
              className={`scroll-dot ${activeSection === "welcome" ? "active" : ""}`}
              title="Välkommen till oss"
            >
              <span className="dot-label">Välkommen</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("home-events")}
              className={`scroll-dot ${activeSection === "events" ? "active" : ""}`}
              title="Kommande evenemang"
            >
              <span className="dot-label">Kommande</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("past-events")}
              className={`scroll-dot ${activeSection === "past" ? "active" : ""}`}
              title="Tidigare evenemang"
            >
              <span className="dot-label">Tidigare</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("home-services")}
              className={`scroll-dot ${activeSection === "services" ? "active" : ""}`}
              title="Vad vi erbjuder"
            >
              <span className="dot-label">Vad vi erbjuder</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("home-contact")}
              className={`scroll-dot ${activeSection === "contact" ? "active" : ""}`}
              title="Hitta hit & kontakt"
            >
              <span className="dot-label">Hitta Hit & Kontakt</span>
            </button>
          </li>
        </ul>
      </nav>

      <header role="banner" id="home-hero">
        <PageSection background="alt" spacing="none" ariaLabel="hero-heading">
          <HomeHeroSection />
        </PageSection>
      </header>

      <main role="main" id="main-content">
        {/* Kommande evenemang */}
        <div id="home-events">
          <PageSection
            background="white"
            spacing="compact"
            ariaLabel="evenemang-heading"
          >
            <FadeInSection>
              <HomeUpcomingEventsSection />
            </FadeInSection>
          </PageSection>
        </div>

        {/* Services - Klickbara kort */}
        <div id="home-services">
          <PageSection
            background="green"
            spacing="compact"
            ariaLabel="services-heading"
          >
            <FadeInSection>
              <HomeServicesSection />
            </FadeInSection>
          </PageSection>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
