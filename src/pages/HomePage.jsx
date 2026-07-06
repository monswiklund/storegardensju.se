import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeHeroSection,
  HomeServicesSection,
  HomeUpcomingEventsSection,
} from "../features/home";
import { PageSection } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { fetchPublicEvents } from "../services/eventsService";
import { toUiEvent } from "../features/home/UpcomingEvents/HomeUpcomingEventsSection.jsx";
import PastEventsAccordion from "../features/home/UpcomingEvents/components/PastEventsAccordion.jsx";

function HomePage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("top");
  const [eventsData, setEventsData] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPublicEvents();
        if (!active) return;
        setEventsData({
          upcoming: Array.isArray(data?.upcoming) ? data.upcoming : [],
          past: Array.isArray(data?.past) ? data.past : [],
        });
      } catch {
        if (!active) return;
        setError("Kunde inte hämta evenemang just nu.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    run();

    return () => {
      active = false;
    };
  }, []);

  const upcomingEvents = useMemo(() => {
    const fetched = eventsData.upcoming
      .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0))
      .map(toUiEvent);

    const staticYogaEvent = {
      title: "Heldag med yoga & måleri",
      spots: "Passar alla",
      date: "13 Juli 2026",
      time: "10:00 - 17:30",
      description: "En stämningsfull heldag fylld med återhämtning och skaparglädje på vackra Storegården 7. Mjukt yogapass med Lina Wiklund på förmiddagen, god lunch på gården, och glädjefylld målarkurs med Ann Wiklund på eftermiddagen.",
      location: "Storegården 7",
      links: [
        {
          href: "/kurser",
          label: "Läs mer & anmäl dig",
        }
      ],
      image: {
        src: "/images/evenemang/yoga-loft.webp",
        alt: "Yoga på loftet"
      }
    };

    return [staticYogaEvent, ...fetched];
  }, [eventsData.upcoming]);

  const pastEvents = useMemo(
    () => eventsData.past
      .sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0))
      .map(toUiEvent),
    [eventsData.past]
  );

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
              <HomeUpcomingEventsSection
                upcomingEvents={upcomingEvents}
                loading={loading}
                error={error}
              />
            </FadeInSection>
          </PageSection>
        </div>

        {/* Tidigare evenemang */}
        <div id="past-events">
          <PageSection
            background="alt"
            spacing="compact"
            ariaLabel="tidigare-evenemang-heading"
          >
            <FadeInSection>
              <PastEventsAccordion events={pastEvents} />
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
