import PropTypes from "prop-types";
import "./ParallaxHero.css";
import ScrollCue from "./components/ScrollCue";
import useParallaxHeroAnimation from "./hooks/useParallaxHeroAnimation";

function ParallaxHero({
  image,
  title,
  subtitle,
  zIndex = 1,
  useWrapper = true,
}) {
  const {
    wrapperRef,
    heroRef,
    contentRef,
    overlayRef,
    backgroundRef,
  } = useParallaxHeroAnimation({ isEnabled: useWrapper });

  const handleScrollDown = () => {
    const nextSection = document.querySelector(".sticky-image-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const heroContent = (
    <section className="parallax-hero" ref={heroRef} style={{ zIndex }}>
      <div
        className="parallax-hero-background"
        ref={backgroundRef}
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="parallax-hero-overlay" ref={overlayRef} />
      {(title || subtitle) && (
        <div className="parallax-hero-content" ref={contentRef}>
          {title && (
            <h1
              className="parallax-hero-title"
              style={{
                whiteSpace: "pre-line",
                textAlign: "center",
                lineHeight: 1.45,
                fontWeight: 300,
              }}
            >
              {title}
            </h1>
          )}
          {subtitle && <p className="parallax-hero-subtitle">{subtitle}</p>}
        </div>
      )}
      <ScrollCue onClick={handleScrollDown} />
    </section>
  );

  if (useWrapper) {
    return (
      <div className="parallax-hero-wrapper" ref={wrapperRef}>
        {heroContent}
      </div>
    );
  }

  return heroContent;
}

ParallaxHero.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  zIndex: PropTypes.number,
  useWrapper: PropTypes.bool,
};

export default ParallaxHero;
