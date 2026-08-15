import { useState } from "react";
import {
  ArrowUpRight,
  CalendarHeart,
  ChevronDown,
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
import usePageCopy from "../../hooks/usePageCopy.js";
import usePageMedia from "../../hooks/usePageMedia.js";
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

function WeddingFaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const slug = question.toLowerCase().replace(/[^a-z0-9åäö]/g, "-").replace(/-+/g, "-");
  const contentId = `wedding-faq-answer-${slug}`;

  return (
    <article className={`wedding-faq-card ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="wedding-faq-card__trigger"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h3>{question}</h3>
        <ChevronDown
          className={`wedding-faq-card__chevron ${isOpen ? "is-open" : ""}`}
          size={20}
          aria-hidden="true"
        />
      </button>
      <div
        id={contentId}
        className={`wedding-faq-card__answer-wrapper ${isOpen ? "is-open" : ""}`}
      >
        <div className="wedding-faq-card__answer-inner">
          <p>{answer}</p>
        </div>
      </div>
    </article>
  );
}

function WeddingPage() {
  useSeo(seoMeta.eventWedding);
  const copy = usePageCopy("wedding");
  const media = usePageMedia("wedding");
  const weddingSpaces = WEDDING_SPACES.map((item, index) => ({
    ...item,
    value: copy(`spaces.items.${index}.value`, item.value),
    title: copy(`spaces.items.${index}.title`, item.title),
    body: copy(`spaces.items.${index}.body`, item.body),
  }));
  const weddingFlow = WEDDING_FLOW.map((item, index) => ({
    title: copy(`flow.steps.${index}.title`, item.title),
    body: copy(`flow.steps.${index}.body`, item.body),
  }));
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
          data-cms-hero
          data-cms-hero-visual
          className="event-hero event-hero--wedding"
          style={{
            backgroundImage: media("hero.background", "/images/event/hero/hero-2.webp", "hero") ? `url(${media("hero.background", "/images/event/hero/hero-2.webp", "hero")})` : "none",
          }}
          aria-labelledby="wedding-heading"
        >
          <div className="event-hero__inner" data-cms-hero-content>
            <span className="event-eyebrow">{copy("hero.eyebrow", "Bröllopslokal nära Lidköping")}</span>
            <div className="section-ornament wedding-hero__ornament" aria-hidden="true">
              <span className="section-ornament-line" />
              <Heart size={20} />
              <span className="section-ornament-line" />
            </div>
            <h1 id="wedding-heading">{copy("hero.title", "Bröllop")}</h1>
            <p>{copy("hero.lead", "En lantlig plats för middag, mingel och dans under samma tak")}</p>
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
                  {media("intro", "/images/event/hero/hero.webp", "card") && <img
                    src={media("intro", "/images/event/hero/hero.webp", "card")}
                    alt="Den renoverade ladan förberedd för bröllop"
                    loading="lazy"
                  />}
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">{copy("intro.eyebrow", "Er bröllopsdag")}</span>
                  <div className="section-ornament align-left" aria-hidden="true">
                    <span className="section-ornament-line" />
                    <CalendarHeart size={18} />
                    <span className="section-ornament-line" />
                  </div>
                  <h2>{copy("intro.title", "Hyr ladan och loftet för hela bröllopsdagen")}</h2>
                  <p>
                    {copy("intro.paragraphs.0", "Storegården 7 ligger i Rackeby, strax utanför Lidköping. Här kan ni ha välkomstskål, middag och fest på samma gård.")}
                  </p>
                  <p>
                    {copy("intro.paragraphs.1", "Ni disponerar den renoverade ladan och loftet och bestämmer själva hur ni vill använda rummen under dagen.")}
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
                <span className="event-section-eyebrow">{copy("spaces.eyebrow", "Ladan och loftet")}</span>
                <h2>{copy("spaces.title", "Plats för middag, mingel och dans")}</h2>
                <p className="event-section-lead">
                  {copy("spaces.lead", "Gästerna kan röra sig mellan våningarna utan att lämna gården.")}
                </p>
              </div>

              <div className="wedding-spaces-grid">
                {weddingSpaces.map(({ Icon, body, title, value }) => (
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
                  <span className="event-section-eyebrow">{copy("flow.eyebrow", "Ett möjligt upplägg")}</span>
                  <div className="section-ornament" aria-hidden="true">
                    <span className="section-ornament-line" />
                    <Sparkles size={19} />
                    <span className="section-ornament-line" />
                  </div>
                  <h2>{copy("flow.title", "Från välkomstskål till dansgolv")}</h2>
                  <p className="event-section-lead">
                    {copy("flow.lead", "Så här kan ni använda de olika delarna av lokalen under dagen.")}
                  </p>
                </div>

                <ol
                  className="event-timeline event-timeline--scroll wedding-timeline"
                  ref={timelineRef}
                  style={{
                    "--event-timeline-progress": timelineProgress,
                  }}
                >
                  {weddingFlow.map((step, index) => (
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
                  {media("freedom", "/images/event/hero/hero-3.webp", "card") && <img
                    src={media("freedom", "/images/event/hero/hero-3.webp", "card")}
                    alt="Glas och stämningsbelysning i bröllopslokalen"
                    loading="lazy"
                  />}
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
                <h2>Vanliga frågor</h2>
              </div>

              <div className="wedding-faq-grid">
                {WEDDING_FAQ.map(({ answer, question }) => (
                  <WeddingFaqItem key={question} question={question} answer={answer} />
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
                cmsPage="wedding"
                excludeId="brollop"
                title={copy("services-section.title", "Utforska mer")}
                eyebrow={copy("services-section.eyebrow", "MER HOS OSS")}
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
