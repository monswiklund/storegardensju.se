import { useState, useEffect } from 'react';

/**
 * Custom hook för scroll parallax-effekter
 * Trackar scroll position och beräknar parallax transforms
 *
 * @param {number} speed - Parallax speed multiplier (default: 0.5)
 * @returns {object} - { scrollY, parallaxY, progress }
 */
function useScrollParallax(speed = 0.5) {
  const [scrollY, setScrollY] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrollY(currentScrollY);
          setParallaxY(currentScrollY * speed);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  // Calculate scroll progress (0-1)
  const progress = Math.min(
    scrollY / (document.documentElement.scrollHeight - window.innerHeight),
    1
  );

  return { scrollY, parallaxY, progress };
}

export default useScrollParallax;
