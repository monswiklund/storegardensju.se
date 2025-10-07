import welcomeImage from "../../../assets/logoTransp.png";
import { useNavigate } from "react-router-dom";
import { heroContent } from "../../../data/homeContent.js";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();
  const { title, subtitle, paragraphs, primaryCta, secondaryCtas } = heroContent;

  const handlePrimaryCta = () => {
    document
      .querySelector(".contact-container")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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
    <div className="hero-container">
      <div className="hero-logo">
        <img src={welcomeImage} alt="Storegården 7 logotyp" />
      </div>
      <div className="hero-titel">
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
