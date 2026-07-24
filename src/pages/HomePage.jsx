import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeHeroSection,
  HomeServicesSection,
  HomeUpcomingEventsSection,
} from "../features/home";
import { PageSection, SectionDivider } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { fetchPublicEvents } from "../services/eventsService";
import { toUiEvent } from "../features/home/UpcomingEvents/HomeUpcomingEventsSection.jsx";
import PastEventsAccordion from "../features/home/UpcomingEvents/components/PastEventsAccordion.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";

const COURSE_DAY_EVENT = {
  id: "heldag-yoga-maleri-2026-07-13",
  title: "Heldag med yoga & måleri",
  spots: "Passade alla",
  startAt: "2026-07-13T10:00:00+02:00",
  endAt: "2026-07-13T17:30:00+02:00",
  description:
    "Den 13 juli hade vi yoga med Lina och måleri med Ann på Storegården 7. Under dagen åt vi också lunch och fikade tillsammans.",
  moments: [
    {
      time: "Kl 10:00",
      title: "Välkommen & Landa",
      description:
        "Dörrarna öppnas på gården. Välkommen av Lina Wiklund att kliva in i lugn och ro, rulla ut din matta på anvisad plats och göra dig hemmastadd.",
      tone: "yoga",
    },
    {
      time: "Kl 10:30–12:00",
      title: "Yoga – Mind, Body & Breath",
      description:
        "Yogapass lett av Lina Wiklund. Fokus på andning, närvaro och rörelse. Passar både nybörjare och vana utövare.",
      tone: "yoga",
    },
    {
      time: "Kl 12:00–13:30",
      title: "Gemensam Lunch",
      description:
        "En härlig, näringsrik lunch serveras på gården. En stund för vila, trevliga samtal och återhämtning i gårdsmiljön.",
      tone: "creative",
    },
    {
      time: "Kl 13:30–17:30",
      title: "Måleri – Glädjefylld Målarkurs",
      description:
        "Kreativ målarkurs ledd av Ann Wiklund. Vi gör roliga, prestationsfria uppvärmningsövningar och målar fritt med akvarell och akryl.",
      tone: "creative",
    },
    {
      time: "Kl 17:30",
      title: "Kaffe, Fika & Avslutning",
      description:
        "Vi avrundar dagen tillsammans och njuter av gott hembakat fika, kaffe och te.",
      tone: "creative",
    },
  ],
  location: "Storegården 7, Rackeby",
  links: [
    {
      href: "/kurser",
      label: "Se återblicken",
    },
  ],
  images: [
    {
      url: "/images/evenemang/yoga-loft.webp",
      alt: "Yoga på loftet på Storegården 7",
    },
    {
      url: "/images/evenemang/maleri-kurs.webp",
      alt: "Målarkurs på Storegården 7",
    },
    {
      url: "/images/evenemang/heldag-paket.webp",
      alt: "Heldag med yoga och måleri på Storegården 7",
    },
  ],
};

const isCourseDayEvent = (event) =>
  event?.id === COURSE_DAY_EVENT.id ||
  event?.startAt === COURSE_DAY_EVENT.startAt;

function HomePage() {
  useSeo(seoMeta.home);
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
      .filter((event) => !isCourseDayEvent(event))
      .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0))
      .map(toUiEvent);

    const courseDayIsUpcoming =
      Date.now() < new Date(COURSE_DAY_EVENT.endAt).getTime();

    return courseDayIsUpcoming
      ? [toUiEvent(COURSE_DAY_EVENT), ...fetched]
      : fetched;
  }, [eventsData.upcoming]);

  const pastEvents = useMemo(() => {
    const fetched = eventsData.past
      .filter((event) => !isCourseDayEvent(event))
      .sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0))
      .map(toUiEvent);

    const courseDayIsPast =
      Date.now() >= new Date(COURSE_DAY_EVENT.endAt).getTime();

    return courseDayIsPast
      ? [toUiEvent(COURSE_DAY_EVENT), ...fetched]
      : fetched;
  }, [eventsData.past]);

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

      <SectionDivider above="alt" below="white" variant="wave" />

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

        <SectionDivider above="white" below="alt" variant="hill" />

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

        <SectionDivider above="alt" below="green" variant="valley" />

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

        <SectionDivider above="green" below="alt" variant="wave" />
      </main>
    </div>
  );
}

export default HomePage;
