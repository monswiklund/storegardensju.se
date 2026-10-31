import PropTypes from "prop-types";
import { Calendar, Image, MapPin, Mail } from "lucide-react";
import HomeHeroCarousel from "./HomeHeroCarousel";

const getIcon = (label) => {
  if (!label) return null;
  const l = label.toLowerCase();

  const bIndex = l.indexOf("boka");
  const eIndex = l.indexOf("evenemang");
  const kIndex = l.indexOf("kontakt");
  const mIndex = l.indexOf("mail");

  // Find the earliest matching keyword index
  const indices = [
    { type: 'calendar', index: bIndex >= 0 ? bIndex : Infinity },
    { type: 'calendar', index: eIndex >= 0 ? eIndex : Infinity },
    { type: 'mail', index: kIndex >= 0 ? kIndex : Infinity },
    { type: 'mail', index: mIndex >= 0 ? mIndex : Infinity },
  ];

  indices.sort((a, b) => a.index - b.index);

  if (indices[0].index !== Infinity) {
    if (indices[0].type === 'calendar') {
      return <Calendar size={20} style={{ strokeWidth: 2.5 }} />;
    } else if (indices[0].type === 'mail') {
      return <Mail size={20} style={{ strokeWidth: 2.5 }} />;
    }
  }

  // Secondary: "Galleri", "Bilder"
  if (l.includes("galleri") || l.includes("se"))
    return <Image size={20} style={{ strokeWidth: 2.5 }} />;

  // Secondary: "Hitta", "Vägbeskrivning", "Karta"
  if (l.includes("hitta") || l.includes("karta"))
    return <MapPin size={20} style={{ strokeWidth: 2.5 }} />;

  return null;
};

function HomeHeroContent({
  logo = "",
  title = "",
  subtitle = "",
  paragraphs = [],
  primaryCta = null,
  secondaryCtas = [],
  onPrimaryClick = undefined,
  onRouteClick = undefined,
  ref = undefined,
}) {
  const handleRouteCta = (to) => {
    if (!to || typeof onRouteClick !== "function") return;
    onRouteClick(to);
  };

  return (
    <div className="hero-content" data-cms-hero-content ref={ref}>
      {logo ? <img className="hero-logo-mark" src={logo} alt="" /> : null}
      {title ? <h1>{title}</h1> : null}
      {subtitle ? <p className="hero-subtitle">{subtitle}</p> : null}
      {paragraphs[0] ? <p>{String(paragraphs[0])}</p> : null}

      {/* The farm in pictures first, then what to do about it. */}
      <HomeHeroCarousel />

      {(primaryCta || (secondaryCtas && secondaryCtas.length > 0)) && (
        <div className="hero-cta-container" data-cms-hero-actions>
          {/* Primary Row - Centered & Alone */}
          {primaryCta && (
            <div className="hero-cta-primary-row">
              <button
                type="button"
                className="btn btn--primary hero-cta"
                onClick={onPrimaryClick}
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
                ({ label, type, href, to }, index) => {
                  if (type === "external") {
                    return (
                      <a
                        key={`secondary-cta-${index}`}
                        className="btn btn--secondary hero-cta"
                        href={href}
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
                      className="btn btn--secondary hero-cta"
                      onClick={() => handleRouteCta(to)}
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

      {paragraphs.length > 1 && (
        <div className="hero-more-text">
          {paragraphs.slice(1).map((text, index) => (
            <p key={`paragraph-${index + 1}`}>{String(text)}</p>
          ))}
        </div>
      )}
    </div>
  );
}

HomeHeroContent.propTypes = {
  logo: PropTypes.string,
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
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

export default HomeHeroContent;
