import { useEffect, useState } from "react";
import { Mail, Palette, Sparkles, Flame, Users } from "lucide-react";
import CreativeWorkshopsSection from "../features/creation/CreativeWorkshopsSection.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { PageSection, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import "./ArtPage.css";

const CONTACT_EMAIL = "bylinawiklund@gmail.com";

function ArtPage() {
  useSeo(seoMeta.konst);
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      const heroSection = document.getElementById("art-hero");
      const contentSection = document.getElementById("art-content-section");
      const offeringsSection = document.getElementById("art-offerings-section");
      const ctaSection = document.getElementById("art-cta-section");

      const getAbsTop = (el) => el ? el.getBoundingClientRect().top + window.pageYOffset : 0;

      if (ctaSection && scrollPosition >= getAbsTop(ctaSection)) {
        setActiveSection("cta");
      } else if (offeringsSection && scrollPosition >= getAbsTop(offeringsSection)) {
        setActiveSection("offerings");
      } else if (contentSection && scrollPosition >= getAbsTop(contentSection)) {
        setActiveSection("content");
      } else {
        setActiveSection("top");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70; // offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="art-page">
      {/* Floating Scroll Indicator Dot Navigation (Scroll Spy) */}
      <nav className="scroll-indicator-nav" aria-label="Sidinnehåll">
        <ul>
          <li>
            <button
              onClick={() => scrollToSection("art-hero")}
              className={`scroll-dot ${activeSection === "top" ? "active" : ""}`}
              title="Till toppen"
            >
              <span className="dot-label">Start</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("art-content-section")}
              className={`scroll-dot ${activeSection === "content" ? "active" : ""}`}
              title="Vår filosofi"
            >
              <span className="dot-label">Filosofi</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("art-offerings-section")}
              className={`scroll-dot ${activeSection === "offerings" ? "active" : ""}`}
              title="Vad vi erbjuder"
            >
              <span className="dot-label">Erbjudanden</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("art-cta-section")}
              className={`scroll-dot ${activeSection === "cta" ? "active" : ""}`}
              title="Boka workshop"
            >
              <span className="dot-label">Boka</span>
            </button>
          </li>
        </ul>
      </nav>

      <main role="main" id="main-content">
        {/* Parallax Hero Section */}
        <section
          id="art-hero"
          className="art-hero"
          style={{ backgroundImage: "url('/images/portfolio/ann-2.webp')" }}
          aria-labelledby="art-heading"
        >
          <div className="art-hero__inner">
            <span className="art-eyebrow">Ateljé & Skaparglädje</span>
            <div className="section-ornament" aria-hidden="true" style={{ color: "var(--accent-color)" }}>
              <span className="section-ornament-line" style={{ background: "var(--accent-color)" }}></span>
              <Palette size={20} />
              <span className="section-ornament-line" style={{ background: "var(--accent-color)" }}></span>
            </div>
            <h1 id="art-heading">Skapande — Målning & Lera</h1>
            <p>Utforska din kreativitet i en inspirerande gårdsateljé på Storegården 7</p>
            <button
              onClick={() => scrollToSection("art-cta-section")}
              className="art-button art-button--primary"
            >
              <Sparkles size={18} />
              Boka en workshop
            </button>
          </div>
        </section>

        {/* Content Section (Philosophy & alternating rows) */}
        <div id="art-content-section">
          <CreativeWorkshopsSection />
        </div>

        {/* Offerings Grid Section */}
        <div id="art-offerings-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="art-section-heading">
                <h2>Vårt kreativa utbud</h2>
                <p>Oavsett om du vill lerkladda med kollegorna eller måla akvarell under en mysig möhippa har vi det perfekta paketet.</p>
              </div>

              <div className="art-offerings-grid">
                <div className="art-offering-card offering-terracotta">
                  <div className="offering-icon-wrapper">
                    <Palette size={28} />
                  </div>
                  <h3>Målningskurser</h3>
                  <p>Prestationsfria kurser i olika tekniker som akvarell och akryl. Vi övar seende, färgkomposition och låter skaparglädjen flöda fritt.</p>
                </div>

                <div className="art-offering-card offering-green">
                  <div className="offering-icon-wrapper">
                    <Flame size={28} />
                  </div>
                  <h3>Keramik & Lera</h3>
                  <p>Handbygge, ringling och drejning i vår mysiga keramikverkstad. Upplev känslan av att forma mjuk lera till ett vackert och varaktigt minne.</p>
                </div>

                <div className="art-offering-card offering-slate">
                  <div className="offering-icon-wrapper">
                    <Users size={28} />
                  </div>
                  <h3>Workshops för alla</h3>
                  <p>Privata kurser anpassade efter er nivå. Perfekt för kompisgänget som vill prova något nytt tillsammans i en vacker och lantlig miljö.</p>
                </div>

                <div className="art-offering-card offering-gold">
                  <div className="offering-icon-wrapper">
                    <Sparkles size={28} />
                  </div>
                  <h3>Teambuilding & Kalas</h3>
                  <p>Unika skapande stunder för företag, möhippor, svensexor och kalas. Vi skräddarsyr dagen med fika, skapande, skratt och mingel.</p>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="green" variant="wave" />

        {/* Booking CTA Section */}
        <div id="art-cta-section">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="art-cta-banner">
                <div className="art-cta-banner__inner">
                  <h2>Planerar du ett event eller vill du gå en kurs?</h2>
                  <p>
                    Våra workshops är otroligt populära för möhippor, födelsedagar och teambuilding. 
                    Hör av dig till oss så sätter vi ihop en oförglömlig dag i ateljén fylld med skaparglädje, fika och konst.
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=Förfrågan: Workshop eller kurs på Storegården 7`}
                    className="art-button art-button--premium"
                  >
                    <Mail size={18} />
                    Skicka en förfrågan
                  </a>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="white" variant="hill" />

        {/* Andra erbjudanden */}
        <div id="art-services-recommendation">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <HomeServicesSection
                excludeId="skapande"
                title="Upptäck mer på gården"
                eyebrow="MER ATT SE & GÖRA"
              />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="wave" />
      </main>
    </div>
  );
}

export default ArtPage;
