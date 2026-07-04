import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";
import HomeHeroContent from "./HomeHeroContent.jsx";

function HomeHeroSection() {
  const navigate = useNavigate();
  const { title, subtitle, paragraphs, primaryCta, secondaryCtas } =
    heroContent;

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
    document
      .querySelector(".contact-container")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSecondaryRoute = (to) => navigate(to);

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
          pointerEvents: heroOpacity <= 0.05 ? "none" : "auto"
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
          title={title}
          subtitle={subtitle}
          paragraphs={paragraphs}
          primaryCta={primaryCta}
          secondaryCtas={secondaryCtas}
          onPrimaryClick={handlePrimaryCta}
          onRouteClick={handleSecondaryRoute}
        />
      </div>
    </>
  );
}

export default HomeHeroSection;
