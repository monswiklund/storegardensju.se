import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import welcomeImage from "../../../assets/logoTransp_cropped.png";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";
import HomeHeroLogo from "./HomeHeroLogo.jsx";
import HomeHeroContent from "./HomeHeroContent.jsx";

function HomeHeroSection() {
  const navigate = useNavigate();
  const { title, subtitle, paragraphs, primaryCta, secondaryCtas } =
    heroContent;

  const contentRef = useRef(null);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isScrollIndicatorVisible, setIsScrollIndicatorVisible] =
    useState(true);

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

  // Hide scroll indicator when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrollIndicatorVisible(false);
      } else {
        setIsScrollIndicatorVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Hero Logo Section - Full Viewport */}
      <div className="hero-logo-section">
        <HomeHeroLogo imageSrc={welcomeImage} alt="Storegården 7 logotyp" />

        <button
          type="button"
          className={`hero-scroll-indicator${
            isScrollIndicatorVisible ? " is-visible" : " is-fading-out"
          }`}
          onClick={handleScrollIndicatorClick}
          aria-label="Skrolla ned"
        >
          <span className="hero-scroll-indicator-label">Upptäck mer</span>
          <svg
            className="hero-scroll-indicator-icon"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </button>
      </div>

      {/* Hero Content Section - Appears on Scroll */}
      <div
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
