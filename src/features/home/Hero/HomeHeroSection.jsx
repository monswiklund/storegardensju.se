import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import welcomeImage from "../../../assets/logoTransp.png";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";
import HomeHeroLogo from "./HomeHeroLogo.jsx";
import HomeHeroContent from "./HomeHeroContent.jsx";

function HomeHeroSection() {
  const navigate = useNavigate();
  const { title, subtitle, paragraphs, primaryCta, secondaryCtas } = heroContent;
  const contentRef = useRef(null);
  const [isTitleVisible, setIsTitleVisible] = useState(false);

  const handlePrimaryCta = () => {
    document
      .querySelector(".contact-container")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSecondaryRoute = (to) => {
    navigate(to);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

      setIsTitleVisible(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsTitleVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsTitleVisible(true);
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    const node = contentRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div className="hero-container">
      <HomeHeroLogo
        imageSrc={welcomeImage}
        alt="Storegården 7 logotyp"
      />
      <HomeHeroContent
        title={title}
        subtitle={subtitle}
        paragraphs={paragraphs}
        primaryCta={primaryCta}
        secondaryCtas={secondaryCtas}
        onPrimaryClick={handlePrimaryCta}
        onRouteClick={handleSecondaryRoute}
        isVisible={isTitleVisible}
        ref={contentRef}
      />
    </div>
  );
}

export default HomeHeroSection;
