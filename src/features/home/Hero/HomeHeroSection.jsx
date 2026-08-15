import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { heroContent } from "../../../data/homeContent.js";
import { canonicalPath } from "../../../config/routes.js";
import usePageCopy from "../../../hooks/usePageCopy.js";
import usePageMedia from "../../../hooks/usePageMedia.js";
import "./Hero.css";
import HomeHeroContent from "./HomeHeroContent.jsx";

function HomeHeroSection() {
  const navigate = useNavigate();
  const copy = usePageCopy("home");
  const siteMedia = usePageMedia("site");
  const logo = siteMedia("brand.logo", "/images/logoTransp_cropped.png", "card");
  const { title, subtitle, paragraphs, primaryCta, secondaryCtas } =
    heroContent;
  const editableParagraphs = paragraphs.map((paragraph, index) =>
    copy(`hero.paragraphs.${index}`, paragraph),
  );

  const contentRef = useRef(null);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isScrollIndicatorVisible, setIsScrollIndicatorVisible] =
    useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);

  // Reveal scroll indicator after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show if we haven't scrolled down yet
      if (window.scrollY <= 100) {
        setIsScrollIndicatorVisible(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handlePrimaryCta = () => {
    window.dispatchEvent(new CustomEvent("expand-contact-form"));
    document
      .querySelector(".contact-container")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSecondaryRoute = (to) => navigate(canonicalPath(to));

  const handleScrollIndicatorClick = () => {
    // Scroll to hero content section
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Intersection Observer to show content when scrolled into view
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContentVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(contentElement);
    return () => observer.disconnect();
  }, []);

  // Track scroll to hide indicator and fade out hero logo section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 100) {
        setIsScrollIndicatorVisible(false);
      } else {
        setIsScrollIndicatorVisible(true);
      }
      
      // Fade out logo section starting at 150px and ending at 400px scroll (150 + 250)
      let opacity = 1;
      if (scrollY > 150) {
        opacity = Math.max(0, 1 - (scrollY - 150) / 250);
      }
      setHeroOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Hero Logo Section - Full Viewport */}
      <div 
        className="hero-logo-section"
        style={{ 
          opacity: heroOpacity,
          pointerEvents: heroOpacity <= 0.05 ? "none" : "auto",
          backgroundImage: logo ? `url(${logo})` : "none",
        }}
      >

        <div
          className={`hero-scroll-indicator-wrapper${
            isScrollIndicatorVisible ? " is-visible" : " is-fading-out"
          }`}
        >
          <button
            type="button"
            className="hero-scroll-indicator"
            onClick={handleScrollIndicatorClick}
            aria-label="Skrolla ned"
          >
            <span className="hero-scroll-indicator-label">Upptäck mer</span>
            <div className="hero-scroll-indicator-line-container">
              <div className="hero-scroll-indicator-line-active" />
            </div>
          </button>
        </div>
      </div>

      {/* Hero Content Section - Appears on Scroll */}
      <div
        id="home-welcome"
        className={`hero-content-section${
          isContentVisible ? " is-visible" : ""
        }`}
        ref={contentRef}
      >
        <HomeHeroContent
          title={copy("hero.title", title)}
          subtitle={copy("hero.subtitle", subtitle)}
          paragraphs={editableParagraphs}
          primaryCta={{ ...primaryCta, label: copy("hero.primary-cta", primaryCta.label) }}
          secondaryCtas={secondaryCtas.map((cta, index) => ({
            ...cta,
            label: copy(`hero.secondary-ctas.${index}`, cta.label),
          }))}
          onPrimaryClick={handlePrimaryCta}
          onRouteClick={handleSecondaryRoute}
        />
      </div>
    </>
  );
}

export default HomeHeroSection;
