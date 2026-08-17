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
import { smoothScrollTo } from "../../utils/scrollUtils.js";
import { HomeServicesSection } from "../../features/home";
import FadeInSection from "../../components/ui/FadeInSection.jsx";
import usePageCopy, { useSiteCopy } from "../../hooks/usePageCopy.js";
import usePageMedia from "../../hooks/usePageMedia.js";
import usePageLists from "../../hooks/usePageLists.js";
import { seoMeta } from "../../config/seoMeta.js";
import { useSeo } from "../../hooks/useSeo.js";
import useSequentialScrollTimeline from "../../hooks/useSequentialScrollTimeline.js";
import "./EventPage.css";
import "./WeddingPage.css";

const SPACE_ICONS = [UtensilsCrossed, GlassWater, Music];

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
        />
      </button>
      <div
        id={contentId}
        className={`wedding-faq-card__body ${isOpen ? "is-open" : ""}`}
      >
        <p>{answer}</p>
      </div>
    </article>
  );
}

function WeddingPage() {
  useSeo(seoMeta.eventWedding || seoMeta.brollop);
  const copy = usePageCopy("wedding");
  const siteCopy = useSiteCopy();
  const media = usePageMedia("wedding");
  const list = usePageLists("wedding");
  const weddingSpaces = list("spaces", []).map((space, index) => ({
    ...space,
    Icon: SPACE_ICONS[index % SPACE_ICONS.length] || Sparkles,
  }));
  const weddingFlow = list("flow", []);
  const freedomBullets = list("freedom-bullets", []);
  const weddingFaq = list("faq", []).filter((item) => item.title && item.body);
  const {
    timelineRef,
    activeSteps: activeTimelineSteps,
    progress: timelineProgress,
  } = useSequentialScrollTimeline(weddingFlow.length);

  const spySections = [
    { id: "wedding-hero", label: siteCopy("nav.start") },
    { id: "wedding-intro", label: copy("intro.title") },
    { id: "wedding-spaces", label: copy("spaces.title") },
    { id: "wedding-flow", label: copy("flow.title") },
    { id: "wedding-freedom", label: copy("freedom.title") },
    { id: "wedding-contact", label: siteCopy("nav.contact") },
    { id: "wedding-faq", label: siteCopy("courses.faq-label") },
  ];

  const handleContactClick = () => {
    window.dispatchEvent(new Event("expand-contact-form"));
    smoothScrollTo(".contact-container", SPY_OFFSET);
  };

  return (
    <div className="event-page-container wedding-page">
      <ScrollSpyNav sections={spySections} offset={SPY_OFFSET} />

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
            <span className="event-eyebrow">{copy("hero.eyebrow")}</span>
            <div className="section-ornament wedding-hero__ornament" aria-hidden="true">
              <span className="section-ornament-line" />
              <Heart size={20} />
              <span className="section-ornament-line" />
            </div>
            <h1 id="wedding-heading">{copy("hero.title")}</h1>
            <p>{copy("hero.lead")}</p>
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
                    alt=""
                    loading="lazy"
                  />}
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">{copy("intro.eyebrow")}</span>
                  <div className="section-ornament align-left" aria-hidden="true">
                    <span className="section-ornament-line" />
                    <CalendarHeart size={18} />
                    <span className="section-ornament-line" />
                  </div>
                  <h2>{copy("intro.title")}</h2>
                  <p>
                    {copy("intro.paragraphs.0")}
                  </p>
                  <p>
                    {copy("intro.paragraphs.1")}
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
                <span className="event-section-eyebrow">{copy("spaces.eyebrow")}</span>
                <h2>{copy("spaces.title")}</h2>
                <p className="event-section-lead">
                  {copy("spaces.lead")}
                </p>
              </div>

              <div className="wedding-spaces-grid">
                {weddingSpaces.map(({ Icon, body, id, title, value }, index) => (
                  <article key={id || title || index} className="wedding-space-card">
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
                  <span className="event-section-eyebrow">{copy("flow.eyebrow")}</span>
                  <div className="section-ornament" aria-hidden="true">
                    <span className="section-ornament-line" />
                    <Sparkles size={19} />
                    <span className="section-ornament-line" />
                  </div>
                  <h2>{copy("flow.title")}</h2>
                  <p className="event-section-lead">
                    {copy("flow.lead")}
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
                    alt=""
                    loading="lazy"
                  />}
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">{copy("freedom.eyebrow")}</span>
                  <h2>{copy("freedom.title")}</h2>
                  <p>{copy("freedom.body")}</p>
                  <ul className="event-bullets">
                    {freedomBullets.map((item, index) => (
                      <li key={item.id || index}><strong>{item.value}</strong> {item.body}</li>
                    ))}
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
                <span className="event-section-eyebrow">{copy("contact.eyebrow")}</span>
                <h2>{copy("contact.title")}</h2>
                <p>{copy("contact.body")}</p>
                <button
                  type="button"
                  className="event-gallery-button event-gallery-button--solid"
                  onClick={handleContactClick}
                >
                  {copy("contact.cta")}
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
                <span className="event-section-eyebrow">{copy("faq.eyebrow")}</span>
                <h2>{copy("faq.title")}</h2>
              </div>

              <div className="wedding-faq-grid">
                {weddingFaq.map(({ body, id, title }) => (
                  <WeddingFaqItem key={id || title} question={title} answer={body} />
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
                title={copy("services-section.title")}
                eyebrow={copy("services-section.eyebrow")}
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
