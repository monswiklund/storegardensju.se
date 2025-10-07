import { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ParallaxHeroStyles.css';

gsap.registerPlugin(ScrollTrigger);

function ParallaxHero({ image, title, subtitle, zIndex = 1 }) {
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const overlayRef = useRef(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const hero = heroRef.current;
    const content = contentRef.current;
    const overlay = overlayRef.current;

    if (!wrapper || !hero) return;

    const triggers = [];

    // Pin the hero section while scrolling through wrapper
    const pinTrigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      pin: hero,
      pinSpacing: false,
    });
    triggers.push(pinTrigger);

    // Animate text and overlay fade in
    if (content && overlay) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top bottom',
          end: 'top center',
          scrub: 1,
        }
      })
      .fromTo(content, { opacity: 0 }, { opacity: 1 }, 0)
      .fromTo(overlay, { opacity: 0 }, { opacity: 0.6 }, 0);

      if (timeline.scrollTrigger) {
        triggers.push(timeline.scrollTrigger);
      }
    }

    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, []);

  const handleScrollDown = () => {
    const nextSection = document.querySelector('.sticky-image-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="parallax-hero-wrapper" ref={wrapperRef}>
      <section className="parallax-hero" ref={heroRef} style={{ zIndex }}>
        <div
          className="parallax-hero-background"
          style={{
            backgroundImage: `url(${image})`,
          }}
        />
        <div className="parallax-hero-overlay" ref={overlayRef} />
        {(title || subtitle) && (
          <div className="parallax-hero-content" ref={contentRef}>
            {title && <h1 className="parallax-hero-title">{title}</h1>}
            {subtitle && <p className="parallax-hero-subtitle">{subtitle}</p>}
          </div>
        )}
        <button
          className="scroll-indicator"
          onClick={handleScrollDown}
          aria-label="Scrolla ner"
        >
          <ChevronDown size={32} />
        </button>
      </section>
    </div>
  );
}

ParallaxHero.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  zIndex: PropTypes.number,
};

export default ParallaxHero;
