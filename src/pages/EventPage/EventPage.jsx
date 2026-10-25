import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  ClipboardList,
  Heart,
  Images,
  Maximize2,
  PartyPopper,
  Sparkles,
  UsersRound,
  Wine,
} from "lucide-react";
import { ExploreMore, PageSection, ScrollSpyNav, SectionDivider } from "../../components";
import FadeInSection from "../../components/ui/FadeInSection.jsx";
import { useSeo } from "../../hooks/useSeo.js";
import usePageCopy, { useSiteCopy } from "../../hooks/usePageCopy.js";
import usePageMedia from "../../hooks/usePageMedia.js";
import usePageLists from "../../hooks/usePageLists.js";
import { seoMeta } from "../../config/seoMeta.js";
import { canonicalPath } from "../../config/routes.js";
import { smoothScrollTo } from "../../utils/scrollUtils.js";
import "./EventPage.css";

// Layout configuration for the 3 event cards in the hero section
const EVENT_TYPES_CONFIG = [
  {
    variant: "wedding",
    to: "/event/brollop/",
    defaultImage: "/images/event/hero/hero-2.webp",
    Icon: Heart,
  },
  {
    variant: "celebration",
    href: "#event-loft-section",
    Icon: Building2,
  },
  {
    variant: "group",
    to: "/gruppdagar/",
    defaultImage: "/images/evenemang/heldag-paket.webp",
    Icon: UsersRound,
  },
];

const SPY_OFFSET = 130;
const PLANNING_STEPS = [0, 1, 2];

/** Sends the visitor to the site's enquiry form, which App renders right after this page. */
function goToContactForm(event, subject) {
  event?.preventDefault?.();
  window.dispatchEvent(
    new CustomEvent("expand-contact-form", { detail: subject ? { subject } : {} })
  );
  smoothScrollTo(".contact-container", SPY_OFFSET);
  // A keyboard activation (click detail 0) continues in the form; a tap does not open the keyboard.
  if (event?.detail === 0) document.getElementById("contact-name")?.focus({ preventScroll: true });
}

function EventPage() {
  useSeo(seoMeta.event);
  const copy = usePageCopy("event");
  const siteCopy = useSiteCopy();
  const media = usePageMedia("event");
  const list = usePageLists("event");
  const eventTypes = EVENT_TYPES_CONFIG.map((item, index) => ({
    ...item,
    image: item.defaultImage ? media(`types.${index}`, item.defaultImage, "card") : null,
    title: copy(`types.${index}.title`),
    description: copy(`types.${index}.description`),
    linkLabel: copy(`types.${index}.cta`),
  }));
  const eventFacts = list("facts", []);
  const capacityBullets = list("capacity-bullets", []);
  const amenitiesBullets = list("amenities-bullets", []);

  const spySections = [
    { id: "event-hero", label: siteCopy("nav.start") },
    { id: "event-details-section", label: copy("intro.title") },
    { id: "event-loft-section", label: copy("capacity.title") },
    { id: "event-amenities-section", label: copy("amenities.title") },
    { id: "event-planning-section", label: copy("planning.title") },
    { id: "event-services-recommendation", label: copy("services.title") },
  ];
  const planningSteps = PLANNING_STEPS.map((index) => ({
    title: copy(`planning.items.${index}.title`),
    body: copy(`planning.items.${index}.body`),
  })).filter((step) => step.title);

  const handleScrollToSection = (e, targetIdOrSelector) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    smoothScrollTo(targetIdOrSelector, SPY_OFFSET);
  };

  return (
    <div className="event-page-container">
      <ScrollSpyNav sections={spySections} offset={SPY_OFFSET} />

      <main role="main" id="main-content" className="event-page">
        {/* Hero Section */}
        <section
          id="event-hero"
          data-cms-hero
          data-cms-hero-visual
          className="event-hero"
          style={{ backgroundImage: media("hero.background", "/images/event/hero/hero.webp", "hero") ? `url(${media("hero.background", "/images/event/hero/hero.webp", "hero")})` : "none" }}
          aria-labelledby="event-heading"
        >
          <div className="event-hero__inner" data-cms-hero-content>
            <span className="event-eyebrow">{copy("hero.eyebrow")}</span>
            <div className="section-ornament event-hero__ornament" aria-hidden="true">
              <span className="section-ornament-line"></span>
              <PartyPopper size={20} />
              <span className="section-ornament-line"></span>
            </div>
            <h1 id="event-heading">{copy("hero.title")}</h1>
            <p>{copy("hero.lead")}</p>
            <div className="event-hero__actions" data-cms-hero-actions>
              <a href="#site-contact" className="btn btn--light" onClick={(e) => goToContactForm(e)}>
                {copy("hero.primary-cta")}
                <ArrowDown size={18} aria-hidden="true" />
              </a>
              <a
                href="#event-details-section"
                className="btn btn--ghost"
                onClick={(e) => handleScrollToSection(e, "event-details-section")}
              >
                {copy("hero.secondary-cta")}
                <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* The curve belongs on the photo so the hero keeps its full image;
              placing a separate divider here would add a pale strip over it. */}
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

        <div id="event-details-section">
          <PageSection background="alt" spacing="default">
            <FadeInSection>
              <div className="event-section-intro">
                <span className="event-section-eyebrow">{copy("intro.eyebrow")}</span>
                <div className="section-ornament" aria-hidden="true">
                  <span className="section-ornament-line"></span>
                  <Wine size={20} />
                  <span className="section-ornament-line"></span>
                </div>
                <h2>{copy("intro.title")}</h2>
                <p className="event-section-lead">
                  {copy("intro.lead")}
                </p>
              </div>

              <div className="event-types-grid">
                {eventTypes.map(
                  ({
                    Icon,
                    description,
                    href,
                    image,
                    linkLabel,
                    title,
                    to,
                    variant,
                  }, index) => {
                    const content = (
                      <>
                        {/* The card's heading names the link, so the photo is decoration. */}
                        {image && (
                          <img
                            className="event-type-card__image"
                            src={image}
                            alt=""
                            loading="lazy"
                          />
                        )}
                        <span className="event-type-card__index" aria-hidden="true">
                          0{index + 1}
                        </span>
                        <div className="event-type-card__content">
                          <span className="event-type-card__icon" aria-hidden="true">
                            <Icon size={23} />
                          </span>
                          <h3>{title}</h3>
                          <p>{description}</p>
                          <span className="event-type-card__link">
                            {linkLabel}
                            <ArrowUpRight size={16} aria-hidden="true" />
                          </span>
                        </div>
                      </>
                    );
                    const className = [
                      "event-type-card",
                      `event-type-card--${variant}`,
                      image ? "event-type-card--image" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return to ? (
                      <Link key={title} className={className} to={to}>
                        {content}
                      </Link>
                    ) : (
                      <a
                        key={title}
                        className={className}
                        href={href}
                        onClick={
                          href?.startsWith("#")
                            ? (e) => handleScrollToSection(e, href)
                            : undefined
                        }
                      >
                        {content}
                      </a>
                    );
                  }
                )}
              </div>

              <div className="event-facts-grid">
                {eventFacts.map((fact) => (
                  <article key={fact.value} className="event-fact-card">
                    <strong>{fact.value}</strong>
                    <p>{fact.body}</p>
                  </article>
                ))}
              </div>

              <div className="event-action-bar">
                <Link
                  className="btn btn--secondary event-gallery-button"
                  to={canonicalPath("/galleri")}
                >
                  <Images size={18} aria-hidden="true" />
                  {copy("intro.gallery-cta")}
                </Link>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="white" variant="valley" />

        <div id="event-loft-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="event-split-layout">
                <div className="event-split-image">
                  {media("capacity", "/images/event/hero/hero-2.webp", "card") && <img src={media("capacity", "/images/event/hero/hero-2.webp", "card")} alt="" />}
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">{copy("capacity.eyebrow")}</span>
                  <div className="section-ornament align-left" aria-hidden="true">
                    <span className="section-ornament-line"></span>
                    <Maximize2 size={18} />
                    <span className="section-ornament-line"></span>
                  </div>
                  <h2>{copy("capacity.title")}</h2>
                  <p>
                    {copy("capacity.body")}
                  </p>
                  <ul className="event-bullets">
                    {capacityBullets.map((item, index) => (
                      <li key={item.id || index}><strong>{item.value}</strong> {item.body}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="green" variant="wave" />

        <div id="event-amenities-section">
          <PageSection background="green" spacing="default">
            <FadeInSection>
              <div className="event-split-layout event-split-layout--reverse">
                <div className="event-split-image">
                  {media("amenities", "/images/event/hero/hero-3.webp", "card") && <img src={media("amenities", "/images/event/hero/hero-3.webp", "card")} alt="Detaljbild från baren i ladan" />}
                </div>
                <div className="event-split-content">
                  <span className="event-section-eyebrow">{copy("amenities.eyebrow")}</span>
                  <div className="section-ornament align-left" aria-hidden="true">
                    <span className="section-ornament-line"></span>
                    <Sparkles size={18} />
                    <span className="section-ornament-line"></span>
                  </div>
                  <h2>{copy("amenities.title")}</h2>
                  <p>
                    {copy("amenities.body")}
                  </p>
                  <ul className="event-bullets">
                    {amenitiesBullets.map((item, index) => (
                      <li key={item.id || index}><strong>{item.value}</strong> {item.body}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="white" variant="hill" />

        {/* How a booking goes, ending in the page's own next step: the enquiry form below. */}
        <div id="event-planning-section">
          <PageSection background="white" spacing="default">
            <FadeInSection>
              <div className="event-planning">
                <div className="event-section-intro event-section-intro--compact">
                  <span className="event-section-eyebrow">{copy("planning.eyebrow")}</span>
                  <div className="section-ornament" aria-hidden="true">
                    <span className="section-ornament-line"></span>
                    <ClipboardList size={19} />
                    <span className="section-ornament-line"></span>
                  </div>
                  <h2>{copy("planning.title")}</h2>
                  <p className="event-section-lead">{copy("planning.lead")}</p>
                </div>

                {planningSteps.length > 0 && (
                  <ol className="event-timeline">
                    {planningSteps.map((step, index) => (
                      <li key={step.title} className="event-timeline__item">
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
                )}

                <div className="event-action-bar event-planning__action">
                  <a
                    href="#site-contact"
                    className="btn btn--primary"
                    onClick={(e) => goToContactForm(e)}
                  >
                    {copy("hero.primary-cta")}
                    <ArrowDown size={18} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="green" variant="wave" />

        <div id="event-services-recommendation">
          <ExploreMore exclude={["event", "fest"]} background="green" />
        </div>

        <SectionDivider above="green" below="alt" variant="valley" />
      </main>
    </div>
  );
}

export default EventPage;
