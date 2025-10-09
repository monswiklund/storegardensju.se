import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import welcomeImage from "../../../assets/logoTransp_cropped.png";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";
import HomeHeroLogo from "./HomeHeroLogo.jsx";
import HomeHeroContent from "./HomeHeroContent.jsx";

function HomeHeroSection() {
  const navigate = useNavigate();
  const { title, subtitle, paragraphs, primaryCta, secondaryCtas } = heroContent;
  const heroRef = useRef(null);
  const logoRef = useRef(null);
  const contentRef = useRef(null);

  const handlePrimaryCta = () => {
    document
      .querySelector(".contact-container")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSecondaryRoute = (to) => {
    navigate(to);
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!heroRef.current || !logoRef.current || !contentRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (prefersReducedMotion.matches) {
      // Skip animations for users who prefer reduced motion
      gsap.set(contentRef.current, { clearProps: "all" });
      gsap.set(logoRef.current, { clearProps: "transform" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.set(contentRef.current, {
      autoAlpha: 0,
      y: 48,
      maxHeight: 0,
      pointerEvents: "none",
    });

    gsap.set(logoRef.current, {
      yPercent: 0,
    });

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top+=180 top",
          once: true,
        },
      });

      timeline.to(logoRef.current, {
        yPercent: -22,
        duration: 1.1,
      });

      timeline.to(
        contentRef.current,
        {
          autoAlpha: 1,
          y: 0,
          maxHeight: 1200,
          pointerEvents: "auto",
          duration: 1.3,
        },
        "-=0.6"
      );

      timeline.add(() => {
        gsap.set(contentRef.current, { clearProps: "maxHeight" });
      });
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="hero-container" ref={heroRef}>
      {/* Responsive grid keeps logo and content balanced across breakpoints */}
      <HomeHeroLogo
        ref={logoRef}
        imageSrc={welcomeImage}
        alt="Storegården 7 logotyp"
      />
      <HomeHeroContent
        ref={contentRef}
        title={title}
        subtitle={subtitle}
        paragraphs={paragraphs}
        primaryCta={primaryCta}
        secondaryCtas={secondaryCtas}
        onPrimaryClick={handlePrimaryCta}
        onRouteClick={handleSecondaryRoute}
      />
    </div>
  );
}

export default HomeHeroSection;
