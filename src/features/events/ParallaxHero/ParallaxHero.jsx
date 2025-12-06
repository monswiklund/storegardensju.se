import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./ParallaxHero.css";
import ScrollCue from "./components/ScrollCue";
import useParallaxHeroAnimation from "./hooks/useParallaxHeroAnimation";

function ParallaxHero({
  image,
  title,
  subtitle,
  zIndex = 1,
  useWrapper = true,
  showScrollCue = true,
  delayScrollCue = false,
}) {
  const { wrapperRef, heroRef, contentRef, overlayRef, backgroundRef } =
    useParallaxHeroAnimation({ isEnabled: useWrapper });

  const [isCueVisible, setIsCueVisible] = useState(!delayScrollCue);

  useEffect(() => {
    if (delayScrollCue) {
      const timer = setTimeout(() => {
        setIsCueVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [delayScrollCue]);

  const handleScrollDown = () => {
    const nextSection = document.querySelector(".sticky-image-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback if no specific class matches or generic scroll
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
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
      {showScrollCue && (
        <div
          style={{
            opacity: isCueVisible ? 1 : 0,
            transition: "opacity 1s ease",
            pointerEvents: isCueVisible ? "auto" : "none",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100px", // Area for the button
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 4,
          }}
        >
          <ScrollCue onClick={handleScrollDown} />
        </div>
      )}
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
