import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Clock,
  Heart,
  Sparkles,
  Mail,
  Palette,
  CheckCircle2,
  Flower2,
} from "lucide-react";
import { PageSection, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import MailtoFallback from "../features/contact/MailtoFallback.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { activeJsonLd, seoMeta } from "../config/seoMeta.js";
import "./KurserPages.css";

const CONTACT_EMAIL = "bylinawiklund@gmail.com";
const COURSE_EVENT_END = new Date("2026-07-14T00:00:00+02:00");

function KurserPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("top");
  const [signupFallback, setSignupFallback] = useState(null);
  const isCourseEventPast = Date.now() >= COURSE_EVENT_END.getTime();
  const kurserJsonLd = useMemo(() => activeJsonLd(seoMeta.kurser), []);

  useSeo({ ...seoMeta.kurser, jsonLd: kurserJsonLd });

  // Smooth scroll handler for anchor links (#yoga and #maleri)
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = location.hash.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        const yOffset = -70; // offset for fixed header
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  // Scroll spy listener to update floating navigation dots based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;
      const sections = [
        ["top", document.getElementById("kurser-hero")],
        ["intro", document.getElementById("kurser-intro-section")],
        ["timeline", document.getElementById("kurser-timeline-section")],
        ["cards", document.getElementById("kurser-cards-section")],
        ["faq", document.getElementById("kurser-faq-section")],
      ];

      let current = "top";
      for (const [id, section] of sections) {
        if (section && scrollPosition >= getAbsTop(section)) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger once on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70; // offset for header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="kurser-page">
      {/* Floating Scroll Indicator Dot Navigation (Scroll Spy) */}
      <nav className="scroll-indicator-nav" aria-label="Sidinnehåll">
        <ul>
          <li>
            <button
              onClick={() => scrollToSection("kurser-hero")}
              className={`scroll-dot ${activeSection === "top" ? "active" : ""}`}
              title="Till toppen"
            >
              <span className="dot-label">Start</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("kurser-intro-section")}
              className={`scroll-dot ${activeSection === "intro" ? "active" : ""}`}
              title="Om kurserna"
            >
              <span className="dot-label">Om kurserna</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("kurser-timeline-section")}
              className={`scroll-dot ${activeSection === "timeline" ? "active" : ""}`}
              title="Öppet datum"
            >
              <span className="dot-label">Öppet datum</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("kurser-cards-section")}
              className={`scroll-dot ${activeSection === "cards" ? "active" : ""}`}
              title="Yogakurs & paket"
            >
              <span className="dot-label">Yoga & Måleri</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("kurser-faq-section")}
              className={`scroll-dot ${activeSection === "faq" ? "active" : ""}`}
              title="Frågor & svar"
            >
              <span className="dot-label">Frågor & svar</span>
            </button>
          </li>
        </ul>
      </nav>

      <main role="main" id="main-content">
        {/* Hero Section */}
        <section
          id="kurser-hero"
          className="kurser-hero"
          style={{ backgroundImage: "url('/images/evenemang/kurser-header.webp')" }}
          aria-labelledby="kurser-heading"
        >
          <div className="kurser-hero__inner">
            <span className="kurser-eyebrow">Yoga & målarkurs nära Lidköping</span>
            <div className="section-ornament" aria-hidden="true" style={{ color: "var(--primary-color)" }}>
              <span className="section-ornament-line" style={{ background: "var(--primary-color)" }}></span>
              <Flower2 size={20} />
              <span className="section-ornament-line" style={{ background: "var(--primary-color)" }}></span>
            </div>
            <h1 id="kurser-heading">Yogakurs & målarkurs i Lidköping</h1>
            <p>Yogapass, skapande målarkurser och heldagar med yoga & måleri på Storegården 7.</p>
            <div className="kurser-hero__actions">
              <a href="#yoga" className="kurser-button kurser-button--primary">
                Boka yoga
              </a>
              <a href="#maleri" className="kurser-button kurser-button--accent">
                Boka målarkurs
              </a>
              <a href="#heldag" className="kurser-button kurser-button--secondary">
                {isCourseEventPast ? "Fråga om nästa datum" : "Se heldag 13 juli"}
              </a>
            </div>
          </div>
        </section>

        <div id="kurser-intro-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="kurser-intro">
                <div>
                  <span className="kurser-eyebrow kurser-eyebrow--inline">Yoga & måleri på gården</span>
                  <h2>Yogakurs och målarkurs nära Lidköping</h2>
                  <p>
                    På Storegården 7 håller Lina Wiklund yogapass med fokus på
                    andning, närvaro och återhämtning. Ann Wiklund leder målarkurs
                    där du får måla med akvarell och akryl i en prestationsfri miljö.
                    Du kan boka yoga, måleri, privat grupp eller kombinera allt till
                    en heldag på gården.
                  </p>
                </div>
                <dl className="kurser-facts">
                  <div>
                    <dt>Plats</dt>
                    <dd>Storegården 7 i Rackeby, 15 min från Lidköping</dd>
                  </div>
                  <div>
                    <dt>Nivå</dt>
                    <dd>Yoga och måleri för både nybörjare och vana deltagare</dd>
                  </div>
                  <div>
                    <dt>Bokning</dt>
                    <dd>Yogakurs, målarkurs, privata grupper och heldagar</dd>
                  </div>
                </dl>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="green" variant="wave" />

        {/* Tidslinje Sektion */}
        <div id="kurser-timeline-section">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="kurser-section-heading">
                <h2>
                  {isCourseEventPast
                    ? "Yogakurs, målarkurs & heldag på Storegården 7"
                    : "Öppet tillfälle: yoga & måleri"}
                </h2>
                {!isCourseEventPast && (
                  <p className="kurser-date-pill">13 juli 2026</p>
                )}
                <p>
                  {isCourseEventPast
                    ? "Nya öppna datum släpps löpande. Upplägget nedan visar hur en heldag med yogapass, målarkurs, lunch och fika kan se ut."
                    : "För dig som vill prova yoga och måla på Storegården 7 finns ett öppet datum med yogapass på förmiddagen, målarkurs på eftermiddagen och heldagspaket med lunch."}
                </p>
              </div>

              <div className="schedule-timeline">
                {/* Kl 10:00 - GRÖN */}
                <div className="timeline-item">
                  <div className="timeline-marker" style={{ borderColor: "var(--primary-color)" }} />
                  <div className="timeline-time" style={{ color: "var(--primary-hover)" }}>Kl 10:00</div>
                  <h4 className="timeline-title">Välkommen & Landa</h4>
                  <p className="timeline-desc">
                    Dörrarna öppnas på gården. Välkommen av Lina Wiklund att kliva in i lugn och ro, rulla ut din matta på anvisad plats och göra dig hemmastadd.
                  </p>
                </div>

                {/* Kl 10:30 - GRÖN */}
                <div className="timeline-item">
                  <div className="timeline-marker" style={{ borderColor: "var(--primary-color)" }} />
                  <div className="timeline-time" style={{ color: "var(--primary-hover)" }}>Kl 10:30 - 12:00</div>
                  <h4 className="timeline-title">Yoga — Mind, Body & Breath</h4>
                  <p className="timeline-desc">
                    Yogapass lett av <strong>Lina Wiklund</strong>. Fokus på andning, närvaro och rörelse. Passar både nybörjare och vana utövare.
                  </p>
                </div>

                {/* Kl 12:00 - BRUN */}
                <div className="timeline-item">
                  <div className="timeline-marker" style={{ borderColor: "var(--accent-color)" }} />
                  <div className="timeline-time" style={{ color: "var(--accent-color)" }}>Kl 12:00 - 13:30</div>
                  <h4 className="timeline-title">Gemensam Lunch</h4>
                  <p className="timeline-desc">
                    En härlig, näringsrik lunch serveras på gården (ingår i heldagspaketet). En stund för vila, trevliga samtal och skön återhämtning i den vackra gårdsmiljön.
                  </p>
                </div>

                {/* Kl 13:30 - BRUN */}
                <div className="timeline-item">
                  <div className="timeline-marker" style={{ borderColor: "var(--accent-color)" }} />
                  <div className="timeline-time" style={{ color: "var(--accent-color)" }}>Kl 13:30 - 17:30</div>
                  <h4 className="timeline-title">Måleri — Glädjefylld Målarkurs</h4>
                  <p className="timeline-desc">
                    Kreativ målarkurs ledd av <strong>Ann Wiklund</strong>. Vi gör roliga, prestationsfria uppvärmningsövningar och målar fritt med akvarell och akryl. Allt konstnärsmaterial ingår!
                  </p>
                </div>

                {/* Kl 17:30 - BRUN */}
                <div className="timeline-item">
                  <div className="timeline-marker" style={{ borderColor: "var(--accent-color)" }} />
                  <div className="timeline-time" style={{ color: "var(--accent-color)" }}>Kl 17:30</div>
                  <h4 className="timeline-title">Kaffe, Fika & Avslutning</h4>
                  <p className="timeline-desc">
                    Vi avrundar en fantastisk dag tillsammans, beundrar skapelserna och njuter av gott hembakat fika, kaffe och te.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="white" variant="wave" />

        {/* Kurser Kort Sektion */}
        <div id="kurser-cards-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="kurser-section-heading">
                <h2>Yogakurs, målarkurs & heldagspaket</h2>
                <p>
                  Välj yogakurs på förmiddagen, målarkurs på eftermiddagen eller boka hela dagen med lunch, fika och tid på gården.
                </p>
              </div>

              <div className="kurser-grid">
                {/* YOGA KORT (LINA - GRÖN) */}
                <article id="yoga" className="kurser-card" style={{ padding: "10px" }}>
                  <div className="kurser-card__image">
                    <img src="/images/evenemang/yoga-loft.webp" alt="Yogakurs på loftet på Storegården 7 nära Lidköping" />
                    <div className="kurser-card__badge" style={{ backgroundColor: "var(--primary-color)", color: "white" }}>
                      <Heart size={14} /> Yoga
                    </div>
                  </div>
                  <div className="kurser-card__content">
                    <div className="event-option-card__time" style={{ color: "var(--primary-hover)", fontSize: "1.05rem", marginBottom: "15px" }}>
                      <Clock size={16} /> Kl 10:00 - 12:00
                    </div>
                    
                    <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>Yogakurs</h3>
                    
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", color: "var(--text-main)" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--primary-color)", flexShrink: 0, marginTop: "2px" }} />
                        <span>Välkommen 10:00 för att landa på mattan och skapa din plats</span>
                      </p>
                      <p style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", color: "var(--text-main)" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--primary-color)", flexShrink: 0, marginTop: "2px" }} />
                        <span><strong>10:30 - 12:00</strong> yoga - mind, body & breath</span>
                      </p>
                      <p style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", color: "var(--text-main)" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--primary-color)", flexShrink: 0, marginTop: "2px" }} />
                        <span>Yogakurs nära Lidköping för nybörjare och vana deltagare</span>
                      </p>
                    </div>

                    <div className="kurser-card__meta" style={{ marginTop: "auto", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                      <span className="kurser-card__price" style={{ color: "var(--primary-hover)" }}>200:- /person <span style={{ fontSize: "0.8rem", fontWeight: "normal", color: "var(--text-secondary)" }}>(ingår kaffe & te)</span></span>
                    </div>

                    {/* Lina Wiklund Bio */}
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "20px", background: "#fafaf9", padding: "12px", borderRadius: "8px", border: "1px solid #f0efeb" }}>
                      <img
                        src="/images/lina-profile.webp"
                        alt="Lina Wiklund"
                        style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-color)" }}
                      />
                      <div>
                        <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: 700 }}>Kursledare</span>
                        <strong style={{ fontSize: "0.95rem" }}>Lina Wiklund</strong>
                      </div>
                    </div>

                    {/* Lina Yoga - GRÖN KNAPP */}
                    <div style={{ marginTop: "20px" }}>
                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=Anmälan: Yoga (13:e juli)`}
                        className="kurser-button kurser-button--primary"
                        style={{ width: "100%", fontSize: "0.95rem", padding: "12px" }}
                        onClick={() => setSignupFallback("Anmälan: Yoga (13:e juli)")}
                      >
                        <Mail size={16} /> Anmäl dig till Yogakurs
                      </a>
                      {signupFallback === "Anmälan: Yoga (13:e juli)" && (
                        <MailtoFallback
                          email={CONTACT_EMAIL}
                          copyText={`Till: ${CONTACT_EMAIL}\nÄmne: Anmälan: Yoga (13:e juli)`}
                        />
                      )}
                    </div>
                  </div>
                </article>

                {/* MÅLERI KORT (ANN - BRUN) */}
                <article id="maleri" className="kurser-card" style={{ padding: "10px" }}>
                  <div className="kurser-card__image">
                    <img src="/images/evenemang/maleri-kurs.webp" alt="Målarkurs i akvarell och akryl nära Lidköping" />
                    <div className="kurser-card__badge" style={{ backgroundColor: "var(--accent-color)", color: "white" }}>
                      <Palette size={14} /> Måleri
                    </div>
                  </div>
                  <div className="kurser-card__content">
                    <div className="event-option-card__time" style={{ color: "var(--accent-color)", fontSize: "1.05rem", marginBottom: "15px" }}>
                      <Clock size={16} /> Kl 13:30 - 17:30
                    </div>
                    
                    <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>Målarkurs</h3>
                    
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", color: "var(--text-main)" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--accent-color)", flexShrink: 0, marginTop: "2px" }} />
                        <span>Glädjefylld målarkurs för både nybörjare och övande</span>
                      </p>
                      <p style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", color: "var(--text-main)" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--accent-color)", flexShrink: 0, marginTop: "2px" }} />
                        <span>Du får måla med akvarell och akryl i lugn gårdsmiljö nära Lidköping</span>
                      </p>
                    </div>

                    <div className="kurser-card__meta" style={{ marginTop: "auto", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                      <span className="kurser-card__price" style={{ color: "var(--accent-color)" }}>600:- /person <span style={{ fontSize: "0.8rem", fontWeight: "normal", color: "var(--text-secondary)" }}>(ingår material, kaffe & fika)</span></span>
                    </div>

                    {/* Ann Wiklund Bio */}
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "20px", background: "#fafaf9", padding: "12px", borderRadius: "8px", border: "1px solid #f0efeb" }}>
                      <img
                        src="/images/ann-profile.webp"
                        alt="Ann Wiklund"
                        style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-color)" }}
                      />
                      <div>
                        <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: 700 }}>Kursledare</span>
                        <strong style={{ fontSize: "0.95rem" }}>Ann Wiklund</strong>
                      </div>
                    </div>

                    {/* Ann Måleri - BRUN KNAPP */}
                    <div style={{ marginTop: "20px" }}>
                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=Anmälan: Måleri (13:e juli)`}
                        className="kurser-button kurser-button--accent"
                        style={{ width: "100%", fontSize: "0.95rem", padding: "12px" }}
                        onClick={() => setSignupFallback("Anmälan: Måleri (13:e juli)")}
                      >
                        <Mail size={16} /> Anmäl dig till Målarkurs
                      </a>
                      {signupFallback === "Anmälan: Måleri (13:e juli)" && (
                        <MailtoFallback
                          email={CONTACT_EMAIL}
                          copyText={`Till: ${CONTACT_EMAIL}\nÄmne: Anmälan: Måleri (13:e juli)`}
                        />
                      )}
                    </div>
                  </div>
                </article>

                {/* HELDAG KORT (LINA & ANN - GRADIENT) */}
                <article 
                  id="heldag" 
                  className="kurser-card" 
                  style={{ 
                    padding: "10px", 
                    border: "2px solid transparent",
                    backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, var(--primary-color), var(--accent-color))",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box"
                  }}
                >
                  <div className="kurser-card__image">
                    <img src="/images/evenemang/heldag-paket.webp" alt="Heldag på gården" />
                    <div className="kurser-card__badge" style={{ background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))", color: "white" }}>
                      <Sparkles size={14} /> Heldag
                    </div>
                  </div>
                  <div className="kurser-card__content">
                    <div className="event-option-card__time" style={{ color: "var(--primary-hover)", fontSize: "1.05rem", marginBottom: "15px" }}>
                      <Clock size={16} /> Kl 10:00 - 17:30
                    </div>
                    
                    <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>Heldag med yoga & måleri</h3>
                    
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", color: "var(--text-main)" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--primary-color)", flexShrink: 0, marginTop: "2px" }} />
                        <span>Heldag med både yoga & måleri på vackra Storegården 7</span>
                      </p>
                      <p style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px", color: "var(--text-main)" }}>
                        <CheckCircle2 size={18} style={{ color: "var(--primary-color)", flexShrink: 0, marginTop: "2px" }} />
                        <span>Perfekt kombination av närvaro, återhämtning och skaparglädje</span>
                      </p>
                    </div>

                    <div className="kurser-card__meta" style={{ marginTop: "auto", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                      <span className="kurser-card__price" style={{ color: "var(--primary-hover)" }}>900:- /person <span style={{ fontSize: "0.8rem", fontWeight: "normal", color: "var(--text-secondary)" }}>(ingår lunch, fika & kaffe)</span></span>
                    </div>

                    {/* Bio Lina & Ann Wiklund */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px", background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "1px solid rgba(95, 111, 82, 0.15)" }}>
                      <div style={{ display: "flex", position: "relative" }}>
                        <img
                          src="/images/lina-profile.webp"
                          alt="Lina Wiklund"
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-color)", zIndex: 2 }}
                        />
                        <img
                          src="/images/ann-profile.webp"
                          alt="Ann Wiklund"
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-color)", marginLeft: "-15px", zIndex: 1 }}
                        />
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: 700 }}>Kursledare</span>
                        <strong style={{ fontSize: "0.9rem", fontWeight: 700 }}>Lina & Ann Wiklund</strong>
                      </div>
                    </div>

                    {/* Heldag - GRADIENT KNAPP */}
                    <div style={{ marginTop: "20px" }}>
                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=Anmälan: Heldag med yoga %26 måleri (13:e juli)`}
                        className="kurser-button"
                        style={{
                          width: "100%",
                          fontSize: "0.95rem",
                          padding: "12px",
                          background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
                          color: "white"
                        }}
                        onClick={() => setSignupFallback("Anmälan: Heldag med yoga & måleri (13:e juli)")}
                      >
                        <Mail size={16} /> Anmäl dig till Heldag
                      </a>
                      {signupFallback === "Anmälan: Heldag med yoga & måleri (13:e juli)" && (
                        <MailtoFallback
                          email={CONTACT_EMAIL}
                          copyText={`Till: ${CONTACT_EMAIL}\nÄmne: Anmälan: Heldag med yoga & måleri (13:e juli)`}
                        />
                      )}
                    </div>
                  </div>
                </article>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="hill" />

        <div id="kurser-faq-section">
          <PageSection background="alt" spacing="default">
            <FadeInSection>
              <div className="kurser-section-heading">
                <h2>Frågor & svar</h2>
                <p>För dig som vill boka yoga, målarkurs eller heldag på Storegården 7 nära Lidköping.</p>
              </div>
              <dl className="kurser-faq">
                <div>
                  <dt>Plats</dt>
                  <dd>Yoga och målarkurs hålls på Storegården 7 i Rackeby, ungefär 15 minuter från Lidköping centrum.</dd>
                </div>
                <div>
                  <dt>Yoga</dt>
                  <dd>Passen är lugna och anpassade så att både nybörjare och vana deltagare kan vara med.</dd>
                </div>
                <div>
                  <dt>Målarkurs</dt>
                  <dd>Målarkursen är prestationsfri och passar både nybörjare och vana deltagare som vill måla med akvarell och akryl.</dd>
                </div>
                <div>
                  <dt>Privat bokning</dt>
                  <dd>Hör av dig om privat yogapass, målarkurs, möhippa, företagsgrupp eller en egen heldag med yoga och måleri.</dd>
                </div>
                <div className="kurser-faq__price">
                  <dt>Pris</dt>
                  <dd>
                    {isCourseEventPast ? (
                      <>
                        <ul className="kurser-price-list">
                          <li>Yogapass: 200 kr/person</li>
                          <li>Målarkurs: 600 kr/person</li>
                          <li>Heldag med yoga, måleri, lunch och fika: 900 kr/person</li>
                        </ul>
                        <p>Kontakta oss för nästa datum eller privat grupp.</p>
                      </>
                    ) : (
                      <ul className="kurser-price-list">
                        <li>Yogapass 13 juli 2026: 200 kr/person</li>
                        <li>Målarkurs 13 juli 2026: 600 kr/person</li>
                        <li>Heldag med yoga, måleri, lunch och fika: 900 kr/person</li>
                      </ul>
                    )}
                  </dd>
                </div>
              </dl>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="green" variant="wave" />

        {/* Andra erbjudanden */}
        <div id="kurser-services-recommendation">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <HomeServicesSection
                excludeId="skapande"
                title="Upptäck mer på gården"
                eyebrow="MER ATT SE & GÖRA"
              />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="alt" variant="hill" />
      </main>
    </div>
  );
}

export default KurserPage;
