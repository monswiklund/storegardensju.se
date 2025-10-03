import { useState, useEffect, useRef } from 'react';
import './StickyImageSectionStyles.css';

function StickyImageSection({
  image,
  imageAlt = ''
}) {
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const sectionRef = useRef(null);

  // Parallax scroll effect
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;

            // Calculate offset based on section position relative to viewport center
            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distanceFromCenter = viewportCenter - sectionCenter;

            // Adjust parallax intensity based on viewport width and orientation
            let multiplier = -0.3; // Desktop default

            if (windowWidth <= 480) {
              multiplier = -0.05; // Very subtle on small mobile
            } else if (windowWidth <= 768) {
              // Check orientation for tablets/mobile
              const isPortrait = windowHeight > windowWidth;
              multiplier = isPortrait ? -0.08 : -0.15;
            } else if (windowWidth <= 1024) {
              multiplier = -0.2; // Slightly reduced on tablets
            }

            // Apply parallax (slower movement than scroll)
            const offset = distanceFromCenter * multiplier;

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
    <section ref={sectionRef} className="sticky-image-section">
      <div className="sticky-image-container">
        <div
          className="sticky-image-wrapper"
          style={{
            transform: `translate(-50%, calc(-50% + ${parallaxOffset}px))`,
          }}
        >
          <div className="sticky-image-parallax">
            <img
              src={image}
              alt={imageAlt}
              className="sticky-image"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StickyImageSection;
