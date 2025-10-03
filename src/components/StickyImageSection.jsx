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

  return (
    <section
      ref={sectionRef}
      className={`sticky-image-section ${isVisible ? 'is-visible' : ''}`}
      style={{ backgroundColor }}
    >
      <div className={`sticky-image-container ${imageSide === 'right' ? 'reverse' : ''}`}>
        <div className="sticky-image-wrapper">
          <img
            src={image}
            alt={imageAlt}
            className="sticky-image"
            loading="lazy"
          />
        </div>
        <div className="sticky-content">
          {children}
        </div>
      </div>
    </section>
  );
}

export default StickyImageSection;
