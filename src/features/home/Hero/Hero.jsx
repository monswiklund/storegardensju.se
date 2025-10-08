import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import welcomeImage from "../../../assets/logoTransp.png";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const { title, subtitle, paragraphs, primaryCta, secondaryCtas } = heroContent;

  const handlePrimaryCta = () => {
    document
      .querySelector(".contact-container")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const heroElement = heroRef.current;
    const logoElement = logoRef.current;
    const textElement = textRef.current;

    if (
      !heroElement ||
      !logoElement ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const mm = ScrollTrigger.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        gsap.set(logoElement, { yPercent: 0, scale: 1.01 });
        if (textElement) {
          gsap.set(textElement, { opacity: 0, yPercent: 14 });
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: heroElement,
            start: "top top",
            end: "+=25%",
            scrub: 0.45,
            pin: logoElement,
            pinSpacing: false,
          },
        });

        timeline.to(logoElement, {
          yPercent: 0.8,
          scale: 0.996,
          ease: "power1.out",
          duration: 0.8,
        });

        if (textElement) {
          timeline.to(
            textElement,
            {
              opacity: 1,
              yPercent: 0,
              ease: "power1.out",
              duration: 0.5,
            },
            0.1
          );
        }
      }, heroElement);

      return () => ctx.revert();
    });

    mm.add("(max-width: 767px)", () => {
      const ctx = gsap.context(() => {
        gsap.set(logoElement, { yPercent: 0, scale: 1.008 });
        if (textElement) {
          gsap.set(textElement, { opacity: 0, yPercent: 16 });
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: heroElement,
            start: "top top",
            end: "+=40%",
            scrub: 0.45,
            pin: logoElement,
            pinSpacing: false,
          },
        });

        timeline.to(logoElement, {
          yPercent: 0.6,
          scale: 0,
          ease: "power1.out",
          duration: 1,
        });

        if (textElement) {
          timeline.to(
            textElement,
            {
              opacity: 1,
              yPercent: -35,
              ease: "power1.out",
              duration: 2.5,
            },
            ">+0.2"
          );
        }
      }, heroElement);

      return () => ctx.revert();
    });

    ScrollTrigger.refresh();

    return () => {
      mm.revert();
    };
  }, []);

  const renderSecondaryCta = (cta) => {
    if (cta.type === "route") {
      return (
        <button
          key={cta.label}
          className="hero-cta hero-cta-secondary"
          onClick={() => navigate(cta.to)}
          aria-label={cta.ariaLabel}
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
    <div className="hero-container" ref={heroRef}>
      <div className="hero-logo">
        <img
          ref={logoRef}
          src={welcomeImage}
          alt="Storegården 7 logotyp"
        />
      </div>
      <div className="hero-titel" ref={textRef}>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
        {paragraphs.map((text, index) => (
          <p key={index}>{text}</p>
        ))}

        <div className="hero-cta-group">
          <button
            className="hero-cta hero-cta-primary"
            onClick={handlePrimaryCta}
            aria-label={primaryCta.ariaLabel}
          >
            {primaryCta.label}
          </button>
          <div className="hero-cta-secondary-group">
            {secondaryCtas.map(renderSecondaryCta)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
