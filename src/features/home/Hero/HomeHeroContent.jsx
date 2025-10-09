import { forwardRef } from "react";
import PropTypes from "prop-types";

const HomeHeroContent = forwardRef((props, ref) => {
  const {
    title,
    subtitle,
    paragraphs,
    primaryCta,
    secondaryCtas,
    onPrimaryClick,
    onRouteClick,
    isVisible,
  } = props;

  const renderSecondaryCta = (cta) => {
    if (cta.type === "route") {
      return (
        <button
          key={cta.label}
          className="hero-cta hero-cta-secondary"
          onClick={() => onRouteClick(cta.to)}
          aria-label={cta.ariaLabel}
          type="button"
        >
          {cta.label}
        </button>
      );
    }

    if (cta.type === "external") {
      return (
        <a
          key={cta.label}
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hero-cta hero-cta-secondary"
          aria-label={cta.ariaLabel}
        >
          {cta.label}
        </a>
      );
    }

    return null;
  };

  return (
    <div className={`hero-titel${isVisible ? " is-visible" : ""}`} ref={ref}>
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      {paragraphs.map((text, index) => (
        <p key={index}>{text}</p>
      ))}

      <div className="hero-cta-group">
        <button
          className="hero-cta hero-cta-primary"
          onClick={onPrimaryClick}
          aria-label={primaryCta.ariaLabel}
          type="button"
        >
          {primaryCta.label}
        </button>
        <div className="hero-cta-secondary-group">
          {secondaryCtas.map(renderSecondaryCta)}
        </div>
      </div>
    </div>
  );
});

HomeHeroContent.displayName = "HomeHeroContent";

HomeHeroContent.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  paragraphs: PropTypes.arrayOf(PropTypes.string).isRequired,
  primaryCta: PropTypes.shape({
    label: PropTypes.string.isRequired,
    ariaLabel: PropTypes.string,
  }).isRequired,
  secondaryCtas: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      ariaLabel: PropTypes.string,
      type: PropTypes.oneOf(["route", "external"]).isRequired,
      to: PropTypes.string,
      href: PropTypes.string,
    })
  ).isRequired,
  onPrimaryClick: PropTypes.func.isRequired,
  onRouteClick: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default HomeHeroContent;
