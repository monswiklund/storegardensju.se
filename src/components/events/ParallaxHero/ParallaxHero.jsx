import { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ParallaxHeroStyles.css';

gsap.registerPlugin(ScrollTrigger);

function ParallaxHero({ image, title, subtitle, zIndex = 1, useWrapper = true }) {
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const overlayRef = useRef(null);
  const backgroundRef = useRef(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    const overlay = overlayRef.current;
    const background = backgroundRef.current;

    if (!hero) return;

    // Check if mobile device (under 768px)
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // On mobile without wrapper, ParallaxHeroGroup handles GSAP - skip here
    if (isMobile && !useWrapper) {
      return;
    }

    // Desktop or wrapper mode: use GSAP pinning
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      // Pin the hero section while scrolling through wrapper
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        pin: hero,
        pinSpacing: false,
        anticipatePin: 1,
      });

      // Animate text and overlay fade in when scrolling through hero
      if (content && overlay) {
        gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: 'top -30%',
            scrub: 1,
          }
        })
        .fromTo(content, { opacity: 0 }, { opacity: 1 }, 0)
        .fromTo(overlay, { opacity: 0 }, { opacity: 0.6 }, 0);
      }

      // Animate background zoom in while scrolling through wrapper (desktop only - too heavy on mobile)
      if (!isMobile && background) {
        gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          }
        })
        .fromTo(background, { scale: 1 }, { scale: 1.1 });
      }
    }, wrapperRef);

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [useWrapper]);

  const handleScrollDown = () => {
    const nextSection = document.querySelector('.sticky-image-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const heroContent = (
    <section className="parallax-hero" ref={heroRef} style={{ zIndex }}>
      <div
        className="parallax-hero-background"
        ref={backgroundRef}
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
  );

  // Conditionally wrap with wrapper div (desktop) or render directly (mobile in group)
  if (useWrapper) {
    return (
      <div className="parallax-hero-wrapper" ref={wrapperRef}>
        {heroContent}
      </div>
    );
  }

  return heroContent;
}

ParallaxHero.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  zIndex: PropTypes.number,
  useWrapper: PropTypes.bool,
};

export default ParallaxHero;
