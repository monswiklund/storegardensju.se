import { useEffect, useState } from "react";
import {
  ArrowDown,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Mail,
  Music,
  Sparkles,
  Utensils,
} from "lucide-react";
import { PageSection } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import "./MohippaPage.css";

const CONTACT_EMAIL = "bylinawiklund@gmail.com";

const HERO_FACTS = [
  { label: "Pris från", value: "500 kr/person" },
  { label: "Tid", value: "10:00-22:00" },
  { label: "Upplägg", value: "Baspaket + tillval" },
];

const BASE_FEATURES = [
  {
    title: "Konsultation",
    text: "Möte på Storegården 7 där vi planerar och styr upp er dag.",
    icon: <Calendar size={20} />,
  },
  {
    title: "Välkomstskål",
    text: "Vi förbereder drycken ni själva köpt in och lämnat dagen innan för kylning.",
    icon: <Heart size={20} />,
  },
  {
    title: "Miljö",
    text: "Uppdukat och dekorerat inomhus med tillgång till ladan, loftet och uteplatserna.",
    icon: <Sparkles size={20} />,
  },
  {
    title: "Musik",
    text: "Vi sköter ljud och musik. Skicka gärna en spellista inför dagen.",
    icon: <Music size={20} />,
  },
  {
    title: "Mat",
    text: "Ni köper maten själva, så hanterar vi den och lägger upp den åt er.",
    icon: <Utensils size={20} />,
  },
];

const DETAILS = [
  "Möjlighet att lämna mat och dryck för kylning dagen innan.",
  "Vi finns på plats under dagen för att hjälpa till med det praktiska.",
  "Vi tar hand om disk och städning så att ni kan fokusera på bruden.",
];

const ACTIVITIES = [
  {
    title: "Yoga",
    tone: "Starta lugnt",
    duration: "1 h",
    description:
      "Ett guidat yogapass anpassat för gruppen. Mattor finns på plats. Ta gärna med eget bubbel för extra festlig stämning.",
    price: "200 kr/person",
    image: "/images/evenemang/slide12.jpg",
  },
  {
    title: "Skapande med färg",
    tone: "Kreativt pass",
    description:
      "Måla din egen tavla och testa olika tekniker. Tavla, färg och utrustning ingår.",
    price: "300 kr/person",
    image: "/images/evenemang/konstafton/konstafton-2025.webp",
  },
  {
    title: "Skapa ditt eget collage",
    tone: "Moodboard",
    description:
      "Bläddra igenom tidningar, böcker och klipp. Klistra, bygg moodboard och skapa en egen vision.",
    price: "100 kr/person",
    image: "/images/evenemang/slide10.jpg",
  },
  {
    title: "Cocktailkurs",
    tone: "Höj tempot",
    description:
      "Lär er att blanda två valfria drinkar. Ni köper själva in alkohol, vi står för utrustning, juicer, mixers och garnityr.",
    price: "300 kr/person",
    image: "/images/evenemang/slide2.jpg",
  },
  {
    title: "Måla din egen keramikskål",
    tone: "Minne från dagen",
    description:
      "Alla får varsin handgjord keramikskål och pennor för porslin. Motivet bränns hemma i ugn efteråt.",
    price: "400 kr/person",
    image: "/images/konst-keramik/slide16.jpg",
  },
];

const formatActivityNumber = (index) => String(index + 1).padStart(2, "0");

function MohippaPage() {
  const [activeSection, setActiveSection] = useState("top");

  // Scroll spy listener to update floating navigation dots based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      const heroSection = document.getElementById("mohippa-hero-section");
      const paketSection = document.getElementById("mohippa-paket");
      const aktiviteterSection = document.getElementById("mohippa-aktiviteter");
      const ctaSection = document.getElementById("mohippa-cta-section");
      const contactSection = document.querySelector(".contact-container");

      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;

      if (contactSection && scrollPosition >= getAbsTop(contactSection)) {
        setActiveSection("contact");
      } else if (ctaSection && scrollPosition >= getAbsTop(ctaSection)) {
        setActiveSection("cta");
      } else if (aktiviteterSection && scrollPosition >= getAbsTop(aktiviteterSection)) {
        setActiveSection("aktiviteter");
      } else if (paketSection && scrollPosition >= getAbsTop(paketSection)) {
        setActiveSection("paket");
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
    if (!element && id === "mohippa-contact") {
      element = document.querySelector(".contact-container");
    }
    if (element) {
      const yOffset = -70; // offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="mohippa-page-container">
      {/* Floating Scroll Indicator Dot Navigation (Scroll Spy) */}
      <nav className="scroll-indicator-nav" aria-label="Sidinnehåll">
        <ul>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-hero-section")}
              className={`scroll-dot ${activeSection === "top" ? "active" : ""}`}
              title="Möhippa på gården"
            >
              <span className="dot-label">Start</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-paket")}
              className={`scroll-dot ${activeSection === "paket" ? "active" : ""}`}
              title="Baspaket"
            >
              <span className="dot-label">Baspaket</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-aktiviteter")}
              className={`scroll-dot ${activeSection === "aktiviteter" ? "active" : ""}`}
              title="Tillval & aktiviteter"
            >
              <span className="dot-label">Tillval & Aktiviteter</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-cta-section")}
              className={`scroll-dot ${activeSection === "cta" ? "active" : ""}`}
              title="Planera er dag"
            >
              <span className="dot-label">Förfrågan</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("mohippa-contact")}
              className={`scroll-dot ${activeSection === "contact" ? "active" : ""}`}
              title="Hitta hit & kontakt"
            >
              <span className="dot-label">Kontakt</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="mohippa-page">
        <main>
          <section id="mohippa-hero-section" className="mohippa-hero" aria-labelledby="mohippa-heading">
            <div className="mohippa-hero__inner">
              <div className="mohippa-hero__copy">
                <span className="mohippa-eyebrow">Möhippa på gården</span>
                <h1 id="mohippa-heading">Möhippa på Storegården 7</h1>
                <p>
                  En färdig grund för dagen, med lokal, hjälp på plats och
                  kreativa tillval som gör firandet personligt.
                </p>

                <div className="mohippa-hero__facts" aria-label="Snabbfakta">
                  {HERO_FACTS.map((fact) => (
                    <div key={fact.label}>
                      <span>{fact.label}</span>
                      <strong>{fact.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="mohippa-hero__actions">
                  <a
                    className="mohippa-button mohippa-button--primary"
                    href={`mailto:${CONTACT_EMAIL}`}
                  >
                    <Mail size={18} />
                    Skicka en förfrågan
                  </a>
                  <button
                    type="button"
                    className="mohippa-button mohippa-button--secondary"
                    onClick={() => scrollToSection("mohippa-aktiviteter")}
                    style={{ background: "none", border: "1px solid rgba(0,0,0,0.15)", cursor: "pointer" }}
                  >
                    Se tillval
                    <ArrowDown size={17} />
                  </button>
                </div>
              </div>

              <div className="mohippa-hero__media" aria-hidden="true">
                <img src="/images/evenemang/slide2.jpg" alt="" />
                <div className="mohippa-hero__note">
                  <strong>Skapa eran dag</strong>
                </div>
              </div>
            </div>
          </section>

          <div id="mohippa-paket">
            <PageSection background="white" spacing="default">
              <FadeInSection>
                <section
                  className="mohippa-package"
                  aria-labelledby="mohippa-package-heading"
                >
                  <div className="mohippa-section-heading">
                    <span className="mohippa-eyebrow">Baspaket</span>
                    <h2 id="mohippa-package-heading">Allt ni behöver som grund</h2>
                    <p>
                      Ni får tillgång till vår lokal, både ladan och loftet samt
                      tillhörande uteplatser. Ni har tillgång 10:00-22:00.
                    </p>
                  </div>

                  <div className="mohippa-package-card">
                    <div className="mohippa-package-card__summary">
                      <div>
                        <span>Baspaketet</span>
                        <strong>500 kr/person</strong>
                      </div>
                      <p>
                        Lokal, planering och praktisk hjälp ingår. Aktiviteter
                        väljer ni till efter grupp och tempo.
                      </p>
                    </div>

                    <div className="mohippa-feature-grid">
                      {BASE_FEATURES.map((feature) => (
                        <article key={feature.title} className="mohippa-feature">
                          <span className="mohippa-feature__icon" aria-hidden="true">
                            {feature.icon}
                          </span>
                          <div>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="mohippa-good-to-know">
                      <h3>Bra att veta</h3>
                      <ul>
                        {DETAILS.map((detail) => (
                          <li key={detail}>
                            <CheckCircle2 size={17} />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              </FadeInSection>
            </PageSection>
          </div>

          <div id="mohippa-aktiviteter">
            <PageSection background="white" spacing="default">
              <FadeInSection>
                <section
                  className="mohippa-activities"
                  aria-labelledby="mohippa-activities-heading"
                >
                  <div className="mohippa-section-heading mohippa-section-heading--split">
                    <div>
                      <span className="mohippa-eyebrow">Tillval & aktiviteter</span>
                      <h2 id="mohippa-activities-heading">
                        Lägg till det som passar gruppen
                      </h2>
                    </div>
                    <p>
                      Välj en lugn start, ett kreativt pass eller något mer
                      festligt. Vi hjälper er att sätta ihop ett upplägg som passar
                      dagen.
                    </p>
                  </div>

                  <div className="mohippa-activity-grid">
                    {ACTIVITIES.map((activity, index) => (
                      <article key={activity.title} className="mohippa-activity">
                        <span className="mohippa-activity__number">
                          {formatActivityNumber(index)}
                        </span>
                        <div className="mohippa-activity__body">
                          <div className="mohippa-activity__header">
                            <span>{activity.tone}</span>
                            <h3>{activity.title}</h3>
                          </div>
                          <p>{activity.description}</p>
                        </div>
                        <div className="mohippa-activity__meta">
                          {activity.duration && (
                            <span>
                              <Clock size={14} />
                              {activity.duration}
                            </span>
                          )}
                          <strong>
                            <small>+ </small>
                            {activity.price}
                          </strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </FadeInSection>
            </PageSection>
          </div>

          <PageSection background="white" spacing="default">
            <FadeInSection>
              <section id="mohippa-cta-section" className="mohippa-cta" aria-labelledby="mohippa-cta-heading">
                <span className="mohippa-eyebrow">Planera er dag</span>
                <h2 id="mohippa-cta-heading">Berätta vad ni vill göra</h2>
                <p>
                  Skriv hur många ni blir, vilket datum ni tänker er och vilka
                  aktiviteter som lockar. Vi återkommer med förslag på upplägg.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mohippa-button mohippa-button--primary"
                >
                  <Mail size={18} />
                  Skicka en förfrågan
                </a>
              </section>
            </FadeInSection>
          </PageSection>
        </main>
      </div>
    </div>
  );
}

export default MohippaPage;
