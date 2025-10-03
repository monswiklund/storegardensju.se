import { useState, useEffect, useRef } from 'react';
import './StickyImageSectionStyles.css';

function StickyImageSection({
  image,
  imageAlt = '',
  imageSide = 'left',
  children,
  backgroundColor = 'white'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate offset based on section position relative to viewport center
            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distanceFromCenter = viewportCenter - sectionCenter;

            // Apply parallax (slower movement than scroll)
            // Negative multiplier to move in opposite direction
            const offset = distanceFromCenter * -0.3;

            setParallaxOffset(offset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`sticky-image-section ${isVisible ? 'is-visible' : ''}`}
      style={{ backgroundColor }}
    >
      <div className={`sticky-image-container ${imageSide === 'right' ? 'reverse' : ''}`}>
        <div className="sticky-image-wrapper">
          <div
            className="sticky-image-parallax"
            style={{
              transform: `translateY(${parallaxOffset}px)`,
            }}
          >
            <img
              src={image}
              alt={imageAlt}
              className="sticky-image"
              loading="lazy"
            />
          </div>
        </div>
        <div className="sticky-image-overlay" />
        <div className="sticky-content">
          {children}
        </div>
      </div>
    </section>
  );
}

export default StickyImageSection;
