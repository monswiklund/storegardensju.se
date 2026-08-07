import {
  ArrowUpRight,
  CalendarHeart,
  GlassWater,
  Heart,
  Music,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { PageSection, ScrollSpyNav, SectionDivider } from "../../components";
import { HomeServicesSection } from "../../features/home";
import FadeInSection from "../../components/ui/FadeInSection.jsx";
import {
  WEDDING_FAQ,
  seoMeta,
} from "../../config/seoMeta.js";
import { useSeo } from "../../hooks/useSeo.js";
import useSequentialScrollTimeline from "../../hooks/useSequentialScrollTimeline.js";
import "./EventPage.css";
import "./WeddingPage.css";

const WEDDING_SPACES = [
  {
    title: "Middag på loftet",
    value: "150+ sittande",
    body: "På loftet finns plats för långbord, middag och tal under takbjälkarna.",
    Icon: UtensilsCrossed,
  },
  {
    title: "Mingel i hela ladan",
    value: "300+ stående",
    body: "Använd båda våningarna så att gästerna kan röra sig mellan rummen under kvällen.",
    Icon: GlassWater,
  },
  {
    title: "Dans och sena timmar",
    value: "Bar & dansgolv",
    body: "Fortsätt kvällen med lounge, bar, ljudanläggning och festbelysning på plats.",
    Icon: Music,
  },
];

const WEDDING_FLOW = [
  {
    title: "Välkomna gästerna",
    body: "Börja med välkomstskål och mingel i ladan eller ute på gården.",
  },
  {
    title: "Samlas till bords",
    body: "Flytta upp till loftet för middag, tal och en lång kväll tillsammans.",
  },
  {
    title: "Öppna dansgolvet",
    body: "Runda av middagen och låt bar, musik och dans ta över resten av natten.",
  },
];

const SPY_SECTIONS = [
  { id: "wedding-hero", label: "Start" },
  { id: "wedding-intro", label: "Bröllopet" },
  { id: "wedding-spaces", label: "Ytor" },
  { id: "wedding-flow", label: "Dagen" },
  { id: "wedding-freedom", label: "Friheten" },
  { id: "wedding-contact", label: "Förfrågan" },
  { id: "wedding-faq", label: "Frågor" },
];

// Matches the fixed navbar and Event section subnav used throughout the hub.
const SPY_OFFSET = 130;

function WeddingPage() {
  useSeo(seoMeta.eventWedding);
  const {
    timelineRef,
    activeSteps: activeTimelineSteps,
    progress: timelineProgress,
  } = useSequentialScrollTimeline(WEDDING_FLOW.length);

  const handleContactClick = () => {
    window.dispatchEvent(new Event("expand-contact-form"));
    const contact = document.querySelector(".contact-container");
    if (!contact) return;
    const top =
      contact.getBoundingClientRect().top + window.scrollY - SPY_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="event-page-container wedding-page">
      <ScrollSpyNav sections={SPY_SECTIONS} offset={SPY_OFFSET} />

      <main id="main-content" className="event-page">
        <section
          id="wedding-hero"
          className="event-hero event-hero--wedding"
          style={{
            backgroundImage: "url('/images/event/hero/hero-2.webp')",
          }}
          aria-labelledby="wedding-heading"
        >
          <div className="event-hero__inner">
            <span className="event-eyebrow">Bröllopslokal nära Lidköping</span>
            <div className="section-ornament wedding-hero__ornament" aria-hidden="true">
              <span className="section-ornament-line" />
              <Heart size={20} />
              <span className="section-ornament-line" />
            </div>
            <h1 id="wedding-heading">Bröllop på Storegården 7</h1>
            <p>En lantlig plats för middag, mingel och dans under samma tak</p>
          </div>

          {/* The photo remains full-height while the wave visually opens the
              quieter introduction band below. */}
          <svg
            className="event-hero__curve"
            viewBox="0 0 1200 48"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M0,24 C300,42 450,6 600,24 C750,42 900,6 1200,24 L1200,48 L0,48 Z"
              fill="currentColor"
            />
          </svg>
        </section>

        <div id="wedding-intro">
          <PageSection background="alt" spacing="default">
            <FadeInSection>
              <div className="event-split-layout wedding-intro">
                <div className="event-split-image wedding-intro__image">
                  <img
                    src="/images/event/hero/hero.webp"
                    alt="Den renoverade ladan förberedd för bröllop"
                    loading="lazy"
                  />
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">Er dag på gården</span>
                  <div className="section-ornament align-left" aria-hidden="true">
                    <span className="section-ornament-line" />
                    <CalendarHeart size={18} />
                    <span className="section-ornament-line" />
                  </div>
                  <h2>Hyr ladan och loftet för hela bröllopsdagen</h2>
                  <p>
                    Storegården 7 ligger i Rackeby, strax utanför Lidköping.
                    Här kan ni ha välkomstskål, middag och fest på samma gård.
                  </p>
                  <p>
                    Ni disponerar den renoverade ladan och loftet och bestämmer
                    själva hur ni vill använda rummen under dagen.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="white" variant="valley" />

        <div id="wedding-spaces">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="event-section-intro">
                <span className="event-section-eyebrow">Ladan och loftet</span>
                <h2>Plats för middag, mingel och dans</h2>
                <p className="event-section-lead">
                  Gästerna kan röra sig mellan våningarna utan att lämna gården.
                </p>
              </div>

              <div className="wedding-spaces-grid">
                {WEDDING_SPACES.map(({ Icon, body, title, value }) => (
                  <article key={title} className="wedding-space-card">
                    <span className="wedding-space-card__icon" aria-hidden="true">
                      <Icon size={23} />
                    </span>
                    <span className="wedding-space-card__value">{value}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="green" variant="wave" />

        <div id="wedding-flow">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="event-planning">
                <div className="event-section-intro event-section-intro--compact">
                  <span className="event-section-eyebrow">Ett möjligt upplägg</span>
                  <div className="section-ornament" aria-hidden="true">
                    <span className="section-ornament-line" />
                    <Sparkles size={19} />
                    <span className="section-ornament-line" />
                  </div>
                  <h2>Från välkomstskål till dansgolv</h2>
                  <p className="event-section-lead">
                    Så här kan ni använda de olika delarna av lokalen under dagen.
                  </p>
                </div>

                <ol
                  className="event-timeline event-timeline--scroll wedding-timeline"
                  ref={timelineRef}
                  style={{
                    "--event-timeline-progress": timelineProgress,
                  }}
                >
                  {WEDDING_FLOW.map((step, index) => (
                    <li
                      key={step.title}
                      className={`event-timeline__item${
                        index < activeTimelineSteps
                          ? " event-timeline__item--active"
                          : ""
                      }`}
                    >
                      <span className="event-timeline__number" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="event-timeline__content">
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="white" variant="hill" />

        <div id="wedding-freedom">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="event-split-layout event-split-layout--reverse wedding-freedom">
                <div className="event-split-image wedding-freedom__image">
                  <img
                    src="/images/event/hero/hero-3.webp"
                    alt="Glas och stämningsbelysning i bröllopslokalen"
                    loading="lazy"
                  />
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">Mat, dryck och hjälp</span>
                  <h2>Ni väljer upplägget själva</h2>
                  <p>
                    Ni får ta med egen mat och dryck och kan välja det upplägg
                    som passar er bäst. På plats finns glas, porslin, bestick,
                    bord och stolar.
                  </p>
                  <ul className="event-bullets">
                    <li>
                      <strong>För middagen:</strong> I köket finns bra
                      arbetsytor, handdisk samt varmt och kallt vatten.
                      Muurikka-hällar kan hyras. Dukning och möbler finns på
                      gården.
                    </li>
                    <li>
                      <strong>För festen:</strong> Bar, lounge, dansgolv, ljud
                      och festbelysning är redo att användas.
                    </li>
                    <li>
                      <strong>För hjälpen:</strong> Vi kan hjälpa till att ordna
                      serveringspersonal, bar eller DJ vid behov.
                    </li>
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="wave" />

        {/* The local CTA sits before the FAQ so it does not repeat the global
            contact block that follows the page shell. */}
        <div id="wedding-contact">
          <PageSection background="alt" spacing="default">
            <FadeInSection>
              <div className="wedding-cta">
                <span className="event-section-eyebrow">Skicka en förfrågan</span>
                <h2>Har ni ett datum och ett ungefärligt gästantal?</h2>
                <p>
                  Berätta vilket datum ni tänker er, ungefär hur många ni blir
                  och vilken hjälp ni behöver.
                </p>
                <button
                  type="button"
                  className="event-gallery-button event-gallery-button--solid"
                  onClick={handleContactClick}
                >
                  Skicka en bröllopsförfrågan
                  <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="green" variant="valley" />

        <div id="wedding-faq">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="event-section-intro wedding-faq__intro">
                <span className="event-section-eyebrow">Bra att veta</span>
                <h2>Vanliga frågor om bröllop på gården</h2>
              </div>

              <div className="wedding-faq-grid">
                {WEDDING_FAQ.map(({ answer, question }) => (
                  <article key={question} className="wedding-faq-card">
                    <h3>{question}</h3>
                    <p>{answer}</p>
                  </article>
                ))}
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="white" variant="hill" />

        <div id="wedding-services-recommendation">
          <PageSection background="white" spacing="none">
            <FadeInSection>
              <HomeServicesSection
                excludeId="brollop"
                title="Utforska mer på gården"
                eyebrow="MER HOS OSS"
              />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="wave" />
      </main>
    </div>
  );
}

export default WeddingPage;
