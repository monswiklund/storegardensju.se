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
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const overlay = overlayRef.current;
    const background = backgroundRef.current;

    if (!hero || !wrapper) return;

    const mm = ScrollTrigger.matchMedia();

    mm.add('(min-width: 769px)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: hero,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      if (content) {
        timeline.fromTo(
          content,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'none' },
          0
        );
      }

      if (overlay) {
        timeline.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 0.6, duration: 0.4, ease: 'none' },
          0
        );
      }

      if (background) {
        timeline.fromTo(
          background,
          { scale: 1 },
          { scale: 1.1, duration: 1, ease: 'none' },
          0
        );
      }

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });

    mm.add('(max-width: 768px)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          pin: hero,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      if (content) {
        timeline.fromTo(
          content,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'none' },
          0
        );
      }

      if (overlay) {
        timeline.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 0.6, duration: 0.4, ease: 'none' },
          0
        );
      }

      if (background) {
        timeline.fromTo(
          background,
          { scale: 1 },
          { scale: 1.05, duration: 1, ease: 'none' },
          0
        );
      }

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    return () => {
      mm.revert();
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
          {title && (
            <h1
              className="parallax-hero-title"
              style={{
                whiteSpace: 'pre-line',
                textAlign: 'center',
                lineHeight: 1.45,
                fontWeight: 300
              }}
            >
              {title}
            </h1>
          )}
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
