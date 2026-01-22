import PropTypes from "prop-types";
import { forwardRef } from "react";
import { Calendar, Image, MapPin } from "lucide-react";
import HomeHeroCarousel from "./HomeHeroCarousel";

const getIcon = (label) => {
  if (!label) return null;
  const l = label.toLowerCase();

  // Primary: "Boka", "Evenemang"
  if (l.includes("boka") || l.includes("evenemang"))
    return <Calendar size={20} style={{ strokeWidth: 2.5 }} />;

  // Secondary: "Galleri", "Bilder"
  if (l.includes("galleri") || l.includes("se"))
    return <Image size={20} style={{ strokeWidth: 2.5 }} />;

  // Secondary: "Hitta", "Vägbeskrivning", "Karta"
  if (l.includes("hitta") || l.includes("karta"))
    return <MapPin size={20} style={{ strokeWidth: 2.5 }} />;

  return null;
};

const HomeHeroContent = forwardRef(function HomeHeroContent(
  {
    title,
    subtitle,
    paragraphs,
    primaryCta,
    secondaryCtas,
    onPrimaryClick,
    onRouteClick,
  },
  ref
) {
  const handleRouteCta = (to) => {
    if (!to || typeof onRouteClick !== "function") return;
    onRouteClick(to);
  };

  return (
    <div className="hero-content" ref={ref}>
      {title ? <h1>{title}</h1> : null}
      {subtitle ? <h2>{subtitle}</h2> : null}

      {Array.isArray(paragraphs)
        ? paragraphs.map((text, index) => {
            const paragraphText =
              typeof text === "string" ? text : String(text);
            return <p key={`paragraph-${index}`}>{paragraphText}</p>;
          })
        : null}

      <HomeHeroCarousel />

      {(primaryCta || (secondaryCtas && secondaryCtas.length > 0)) && (
        <div className="hero-cta-container">
          {/* Primary Row - Centered & Alone */}
          {primaryCta && (
            <div className="hero-cta-primary-row">
              <button
                type="button"
                className="hero-cta hero-cta-primary"
                onClick={onPrimaryClick}
                aria-label={primaryCta.ariaLabel || primaryCta.label}
              >
                {getIcon(primaryCta.label)}
                <span>{primaryCta.label}</span>
              </button>
            </div>
          )}

          {/* Secondary Row - Centered & Side-by-Side */}
          {secondaryCtas && secondaryCtas.length > 0 && (
            <div className="hero-cta-secondary-row">
              {secondaryCtas.map(
                ({ label, ariaLabel, type, href, to }, index) => {
                  if (type === "external") {
                    return (
                      <a
                        key={`secondary-cta-${index}`}
                        className="hero-cta hero-cta-secondary"
                        href={href}
                        aria-label={ariaLabel || label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getIcon(label)}
                        <span>{label}</span>
                      </a>
                    );
                  }

                  return (
                    <button
                      key={`secondary-cta-${index}`}
                      type="button"
                      className="hero-cta hero-cta-secondary"
                      onClick={() => handleRouteCta(to)}
                      aria-label={ariaLabel || label}
                      disabled={!to || typeof onRouteClick !== "function"}
                    >
                      {getIcon(label)}
                      <span>{label}</span>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

HomeHeroContent.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  paragraphs: PropTypes.arrayOf(PropTypes.string),
  primaryCta: PropTypes.shape({
    label: PropTypes.string.isRequired,
    ariaLabel: PropTypes.string,
  }),
  secondaryCtas: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      ariaLabel: PropTypes.string,
      type: PropTypes.oneOf(["route", "external"]),
      to: PropTypes.string,
      href: PropTypes.string,
    })
  ),
  onPrimaryClick: PropTypes.func,
  onRouteClick: PropTypes.func,
};

HomeHeroContent.defaultProps = {
  title: "",
  subtitle: "",
  paragraphs: [],
  primaryCta: null,
  secondaryCtas: [],
  onPrimaryClick: undefined,
  onRouteClick: undefined,
};

export default HomeHeroContent;
