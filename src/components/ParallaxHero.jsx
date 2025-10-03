import { ChevronDown } from 'lucide-react';
import useScrollParallax from '../hooks/useScrollParallax';
import './ParallaxHeroStyles.css';

function ParallaxHero({ image, title, subtitle }) {
  const { parallaxY } = useScrollParallax(0.4);

  const handleScrollDown = () => {
    const firstSection = document.querySelector('.event-story-section');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="parallax-hero">
      <div
        className="parallax-hero-background"
        style={{
          backgroundImage: `url(${image})`,
          transform: `translateY(${parallaxY}px)`,
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
