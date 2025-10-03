import { ChevronDown } from 'lucide-react';
import './ParallaxHeroStyles.css';

function ParallaxHero({ image, title, subtitle }) {
  const handleScrollDown = () => {
    const nextSection = document.querySelector('.sticky-image-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="parallax-hero">
      <div
        className="parallax-hero-background"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
      <div className="parallax-hero-overlay" />
      <div className="parallax-hero-content">
        <h1 className="parallax-hero-title">{title}</h1>
        {subtitle && <p className="parallax-hero-subtitle">{subtitle}</p>}
      </div>
      <button
        className="scroll-indicator"
        onClick={handleScrollDown}
        aria-label="Scrolla ner"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
}

export default ParallaxHero;
