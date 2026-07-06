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
  Palette,
} from "lucide-react";
import { PageSection, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
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
    id: "yoga",
    title: "Yoga",
    tone: "Starta lugnt",
    duration: "1 h",
    description:
      "Ett guidat yogapass anpassat för gruppen. Mattor finns på plats. Ta gärna med eget bubbel för extra festlig stämning.",
    price: "200 kr/person",
    priceVal: 200,
    category: "lugn",
    image: "/images/evenemang/slide12.webp",
  },
  {
    id: "farg",
    title: "Skapande med färg",
    tone: "Kreativt pass",
    description:
      "Måla din egen tavla och testa olika tekniker. Tavla, färg och utrustning ingår.",
    price: "300 kr/person",
    priceVal: 300,
    category: "kreativt",
    image: "/images/evenemang/konstafton/konstafton-2025.webp",
  },
  {
    id: "collage",
    title: "Skapa ditt eget collage",
    tone: "Moodboard",
    description:
      "Bläddra igenom tidningar, böcker och klipp. Klistra, bygg moodboard och skapa en egen vision.",
    price: "100 kr/person",
    priceVal: 100,
    category: "lugn",
    image: "/images/evenemang/slide10.webp",
  },
  {
    id: "cocktail",
    title: "Cocktailkurs",
    tone: "Höj tempot",
    description:
      "Lär er att blanda två valfria drinkar. Ni köper själva in alkohol, vi står för utrustning, juicer, mixers och garnityr.",
    price: "300 kr/person",
    priceVal: 300,
    category: "festligt",
    image: "/images/evenemang/slide2.webp",
  },
  {
    id: "keramik",
    title: "Måla din egen keramikskål",
    tone: "Minne från dagen",
    description:
      "Alla får varsin handgjord keramikskål och pennor för porslin. Motivet bränns hemma i ugn efteråt.",
    price: "400 kr/person",
    priceVal: 400,
    category: "kreativt",
    image: "/images/konst-keramik/slide16.webp",
  },
];

const formatActivityNumber = (index) => String(index + 1).padStart(2, "0");

function MohippaPage() {
  useSeo(seoMeta.mohippa);
  const [activeSection, setActiveSection] = useState("top");
  const [mainTab, setMainTab] = useState("baspaket"); // "baspaket" or "aktiviteter"
  const [activeTab, setActiveTab] = useState("alla");
  const [guestCount, setGuestCount] = useState(10);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const toggleActivity = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const basePricePerPerson = 500;
  const selectedObjects = ACTIVITIES.filter((a) => selectedActivities.includes(a.id));
  const activitiesPricePerPerson = selectedObjects.reduce((sum, a) => sum + a.priceVal, 0);
  const totalPerPerson = basePricePerPerson + activitiesPricePerPerson;
  const grandTotal = totalPerPerson * guestCount;

  const getMailtoLink = () => {
    const activitiesText = selectedObjects.length > 0
      ? selectedObjects.map((a) => `- ${a.title} (${a.price})`).join("\n")
      : "- Inga tillval valda";

    const subject = encodeURIComponent("Förfrågan Möhippa på Storegården 7");
    const body = encodeURIComponent(
      `Hej Storegården 7!\n\n` +
      `Vi vill gärna skicka en förfrågan om möhippa hos er.\n\n` +
      `Här är våra önskemål:\n` +
      `- Antal personer: ${guestCount} st\n` +
      `- Paket: Baspaket (500 kr/person)\n` +
      `- Valda aktiviteter:\n${activitiesText}\n\n` +
      `Uppskattad totalkostnad: ${grandTotal.toLocaleString("sv-SE")} kr (${totalPerPerson} kr/person)\n\n` +
      `Vi önskar preliminärt datum: [Fyll i önskat datum här]\n\n` +
      `Hör gärna av er med förslag på upplägg och tillgänglighet!\n\n` +
      `Med vänliga hälsningar,\n` +
      `[Ditt namn]\n` +
      `[Ditt telefonnummer]`
    );

    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // Scroll spy listener to update floating navigation dots based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      const heroSection = document.getElementById("mohippa-hero-section");
      const planeringSection = document.getElementById("mohippa-planering");
      const ctaSection = document.getElementById("mohippa-cta-section");
      const contactSection = document.querySelector(".contact-container");

      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;

      if (contactSection && scrollPosition >= getAbsTop(contactSection)) {
        setActiveSection("contact");
      } else if (ctaSection && scrollPosition >= getAbsTop(ctaSection)) {
        setActiveSection("cta");
      } else if (planeringSection && scrollPosition >= getAbsTop(planeringSection)) {
        setActiveSection("planering");
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
              onClick={() => scrollToSection("mohippa-planering")}
              className={`scroll-dot ${activeSection === "planering" ? "active" : ""}`}
              title="Planera er dag"
            >
              <span className="dot-label">Planering</span>
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
                  <button
                    type="button"
                    className="mohippa-button mohippa-button--primary"
                    onClick={() => {
                      setMainTab("baspaket");
                      scrollToSection("mohippa-planering");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Planera er dag
                  </button>
                  <button
                    type="button"
                    className="mohippa-button mohippa-button--secondary"
                    onClick={() => {
                      setMainTab("aktiviteter");
                      scrollToSection("mohippa-planering");
                    }}
                    style={{ background: "none", border: "1px solid rgba(0,0,0,0.15)", cursor: "pointer" }}
                  >
                    Se tillval
                    <ArrowDown size={17} />
                  </button>
                </div>
              </div>

              <div className="mohippa-hero__media" aria-hidden="true">
                <img src="/images/evenemang/slide2.webp" alt="" />
                <div className="mohippa-hero__note">
                  <strong>Skapa eran dag</strong>
                </div>
              </div>
            </div>
          </section>

          <div id="mohippa-planering">
            <PageSection background="white" spacing="default">
              <FadeInSection>
                <div className="mohippa-planner-workspace">
                  
                  {/* Left Column: Sticky Calculator */}
                  <div className="mohippa-package-card__summary">
                    <div className="mohippa-summary__header">
                      <span>Baspaketet</span>
                      <strong>500 kr/person</strong>
                    </div>
                    <p className="mohippa-summary__desc">
                      Lokal, planering och praktisk hjälp ingår. Klicka på flikarna till höger för att planera och välja tillval.
                    </p>

                    <div className="mohippa-calculator">
                      <div className="mohippa-calculator__field">
                        <label htmlFor="guest-count">Antal personer</label>
                        <div className="mohippa-guest-picker">
                          <button
                            type="button"
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            aria-label="Minska antal personer"
                          >
                            -
                          </button>
                          <input
                            id="guest-count"
                            type="number"
                            min="1"
                            max="100"
                            value={guestCount}
                            onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <button
                            type="button"
                            onClick={() => setGuestCount(guestCount + 1)}
                            aria-label="Öka antal personer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mohippa-calculator__breakdown">
                        <div className="mohippa-breakdown-row">
                          <span>Baspaket ({guestCount} st):</span>
                          <span>{(guestCount * basePricePerPerson).toLocaleString("sv-SE")} kr</span>
                        </div>
                        {selectedObjects.length > 0 && (
                          <div className="mohippa-breakdown-row mohippa-breakdown-row--details">
                            <span>Tillval ({selectedObjects.length} st):</span>
                            <span>{(guestCount * activitiesPricePerPerson).toLocaleString("sv-SE")} kr</span>
                          </div>
                        )}
                        {selectedObjects.length > 0 && (
                          <ul className="mohippa-selected-list">
                            {selectedObjects.map((a) => (
                              <li key={a.id}>
                                <span>{a.title}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleActivity(a.id)}
                                  title="Ta bort tillval"
                                  aria-label={`Ta bort ${a.title}`}
                                >
                                  &times;
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mohippa-breakdown-row mohippa-breakdown-row--total">
                          <span>Uppskattat totalpris:</span>
                          <strong>{grandTotal.toLocaleString("sv-SE")} kr</strong>
                        </div>
                        <div className="mohippa-price-per-person">
                          ({totalPerPerson} kr/person)
                        </div>
                      </div>

                      <a
                        className="mohippa-button mohippa-button--primary mohippa-calculator__button"
                        href={getMailtoLink()}
                      >
                        <Mail size={18} />
                        Skicka förfrågan
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Tabbed Content */}
                  <div className="mohippa-planner-content">
                    {/* Main Tabs */}
                    <div className="mohippa-main-tabs">
                       <button
                        type="button"
                        className={`mohippa-main-tab-btn ${mainTab === "baspaket" ? "active" : ""}`}
                        onClick={() => setMainTab("baspaket")}
                      >
                        1. Baspaket
                      </button>
                      <button
                        type="button"
                        className={`mohippa-main-tab-btn ${mainTab === "aktiviteter" ? "active" : ""}`}
                        onClick={() => setMainTab("aktiviteter")}
                      >
                        2. Välj tillvalsaktiviteter
                      </button>
                    </div>

                    {/* Tab Contents */}
                    {mainTab === "baspaket" && (
                      <div className="mohippa-tab-content-pane">
                        <div className="mohippa-section-heading">
                          <span className="mohippa-eyebrow">Baspaket</span>
                          <div className="section-ornament align-left" aria-hidden="true">
                            <span className="section-ornament-line"></span>
                            <Heart size={18} />
                            <span className="section-ornament-line"></span>
                          </div>
                          <h2 id="mohippa-package-heading">Allt ni behöver som grund</h2>
                          <p>
                            Ni får tillgång till vår lokal, både ladan och loftet samt
                            tillhörande uteplatser. Ni har tillgång 10:00-22:00.
                          </p>
                        </div>
                        
                        <div className="mohippa-checklist">
                          {BASE_FEATURES.map((feature) => (
                            <div key={feature.title} className="mohippa-checklist-item">
                              <span className="mohippa-checklist-item__icon" aria-hidden="true">
                                {feature.icon}
                              </span>
                              <div className="mohippa-checklist-item__content">
                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                              </div>
                            </div>
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
                    )}

                    {mainTab === "aktiviteter" && (
                      <div className="mohippa-tab-content-pane">
                        <div className="mohippa-section-heading">
                          <span className="mohippa-eyebrow">Tillval & aktiviteter</span>
                          <div className="section-ornament align-left" aria-hidden="true">
                            <span className="section-ornament-line"></span>
                            <Palette size={18} />
                            <span className="section-ornament-line"></span>
                          </div>
                          <h2 id="mohippa-activities-heading">
                            Lägg till det som passar gruppen
                          </h2>
                          <p>
                            Välj en lugn start, ett kreativt pass eller något mer
                            festligt. Vi hjälper er att sätta ihop ett upplägg som passar
                            dagen. Kryssa i tillvalen nedan för att lägga till dem i kalkylen till vänster!
                          </p>
                        </div>

                        <div className="mohippa-tabs">
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "alla" ? "active" : ""}`}
                            onClick={() => setActiveTab("alla")}
                          >
                            Visa alla
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "lugn" ? "active" : ""}`}
                            onClick={() => setActiveTab("lugn")}
                          >
                            Lugn & Fokus
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "kreativt" ? "active" : ""}`}
                            onClick={() => setActiveTab("kreativt")}
                          >
                            Kreativt skapande
                          </button>
                          <button
                            type="button"
                            className={`mohippa-tab-btn ${activeTab === "festligt" ? "active" : ""}`}
                            onClick={() => setActiveTab("festligt")}
                          >
                            Mat, dryck & fest
                          </button>
                        </div>

                        <div className="mohippa-activity-grid">
                          {ACTIVITIES.filter(
                            (activity) => activeTab === "alla" || activity.category === activeTab
                          ).map((activity, index) => {
                            const isSelected = selectedActivities.includes(activity.id);
                            return (
                              <article
                                key={activity.title}
                                className={`mohippa-activity ${isSelected ? "mohippa-activity--selected" : ""}`}
                                onClick={() => toggleActivity(activity.id)}
                                style={{ cursor: "pointer" }}
                              >
                                <span className="mohippa-activity__number">
                                  {formatActivityNumber(index)}
                                </span>
                                <div className="mohippa-activity__body">
                                  <div className="mohippa-activity__header">
                                    <h3>{activity.title}</h3>
                                  </div>
                                  <p>{activity.description}</p>
                                </div>
                                <div className="mohippa-activity__meta" onClick={(e) => e.stopPropagation()}>
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
                                  <button
                                    type="button"
                                    className={`mohippa-select-btn ${isSelected ? "mohippa-select-btn--selected" : ""}`}
                                    onClick={() => toggleActivity(activity.id)}
                                  >
                                    {isSelected ? (
                                      <>
                                        <CheckCircle2 size={14} />
                                        Vald
                                      </>
                                    ) : (
                                      "Lägg till"
                                    )}
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </FadeInSection>
            </PageSection>
          </div>

          <SectionDivider above="white" below="green" variant="wave" />

          {/* Andra erbjudanden */}
          <div id="mohippa-services-recommendation">
            <PageSection background="green" spacing="default">
              <FadeInSection>
                <HomeServicesSection
                  excludeId="mohippa"
                  title="Planera mer på gården"
                  eyebrow="FLER AKTIVITETER"
                />
              </FadeInSection>
            </PageSection>
          </div>

          <SectionDivider above="green" below="alt" variant="hill" />
        </main>
      </div>
    </div>
  );
}

export default MohippaPage;
