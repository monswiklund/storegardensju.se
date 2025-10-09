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
      contentRef.current.setAttribute("aria-hidden", "false");
      contentRef.current.style.pointerEvents = "auto";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.set(contentRef.current, {
      autoAlpha: 0,
      y: 56,
      maxHeight: 0,
      pointerEvents: "none",
    });
    contentRef.current.setAttribute("aria-hidden", "true");

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
          start: "top top",
          end: "+=120%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          onLeave: () => {
            if (contentRef.current) {
              contentRef.current.setAttribute("aria-hidden", "false");
              contentRef.current.style.pointerEvents = "auto";
            }
          },
        },
      });

      timeline.to(logoRef.current, {
        yPercent: -28,
        duration: 1.2,
      });

      timeline.to(
        contentRef.current,
        {
          autoAlpha: 1,
          y: 0,
          maxHeight: 1200,
          duration: 1.2,
          onUpdate: () => {
            if (contentRef.current) {
              const isVisible = gsap.getProperty(contentRef.current, "autoAlpha") > 0.6;
              contentRef.current.style.pointerEvents = isVisible ? "auto" : "none";
            }
          },
        },
        0.2
      );

      timeline.add(() => {
        if (contentRef.current) {
          gsap.set(contentRef.current, { clearProps: "maxHeight" });
        }
      });
    }, heroRef);

    return () => {
      ctx.revert();
      if (contentRef.current) {
        contentRef.current.setAttribute("aria-hidden", "false");
        contentRef.current.style.pointerEvents = "auto";
      }
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
