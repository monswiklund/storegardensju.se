import PropTypes from "prop-types";
import { forwardRef } from "react";

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

      {(primaryCta || (secondaryCtas && secondaryCtas.length > 0)) && (
        <div className="hero-cta-group">
          {primaryCta ? (
            <button
              type="button"
              className="hero-cta hero-cta-primary"
              onClick={onPrimaryClick}
              aria-label={primaryCta.ariaLabel || primaryCta.label}
            >
              {primaryCta.label}
            </button>
          ) : null}

          {secondaryCtas && secondaryCtas.length > 0
            ? secondaryCtas.map(
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
                        {label}
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
                      {label}
                    </button>
                  );
                }
              )
            : null}
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
