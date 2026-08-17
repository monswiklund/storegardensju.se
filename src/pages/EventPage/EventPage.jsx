import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Building2,
  Heart,
  Maximize2,
  PartyPopper,
  Sparkles,
  UsersRound,
  Wine,
} from "lucide-react";
import { PageSection, ScrollSpyNav, SectionDivider } from "../../components";
import { HomeServicesSection } from "../../features/home";
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

function EventPage() {
  useSeo(seoMeta.event);
  const navigate = useNavigate();
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
    { id: "event-services-recommendation", label: copy("services.title") },
  ];

  const handleGalleryClick = () => {
    navigate(canonicalPath("/galleri"));
  };

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
              <Link to="/kontakt/" className="event-button event-button--primary">
                {copy("hero.primary-cta")}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#event-details-section"
                className="event-button event-button--secondary"
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
                    imageAlt,
                    linkLabel,
                    title,
                    to,
                    variant,
                  }, index) => {
                    const content = (
                      <>
                        {image && (
                          <img
                            className="event-type-card__image"
                            src={image}
                            alt={imageAlt}
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
                <button
                  className="event-gallery-button event-gallery-button--solid"
                  type="button"
                  onClick={handleGalleryClick}
                >
                  {copy("intro.gallery-cta")}
                </button>
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

        <div id="event-services-recommendation">
          <PageSection background="white" spacing="none">
            <FadeInSection>
              <HomeServicesSection
                cmsPage="event"
                excludeId="event"
                title={copy("services-section.title")}
                eyebrow={copy("services-section.eyebrow")}
              />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="valley" />
      </main>
    </div>
  );
}

export default EventPage;
