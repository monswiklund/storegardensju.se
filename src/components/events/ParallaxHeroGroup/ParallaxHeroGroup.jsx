import { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ParallaxHeroGroupStyles.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Container for multiple ParallaxHero sections
 * This provides a shared scroll context for all heroes to enable longer sticky effects without gaps
 */
function ParallaxHeroGroup({ children }) {
  const groupRef = useRef(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const heroes = group.querySelectorAll('.parallax-hero');
    if (heroes.length === 0) return;

    const ctx = gsap.context(() => {
      heroes.forEach((hero, index) => {
        const content = hero.querySelector('.parallax-hero-content');
        const overlay = hero.querySelector('.parallax-hero-overlay');

        // Pin each hero while scrolling through the group
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: () => {
            // Calculate end based on remaining heroes
            const heroHeight = hero.offsetHeight;
            const remainingHeroes = heroes.length - index - 1;
            const extraScroll = heroHeight * remainingHeroes * 1.5; // 1.5x for longer sticky
            return `+=${extraScroll}`;
          },
          pin: hero,
          pinSpacing: false,
          anticipatePin: 1,
        });

        // Fade in text and overlay when hero reaches top
        if (content && overlay) {
          gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'top -30%',
              scrub: 1,
            }
          })
          .fromTo(content, { opacity: 0 }, { opacity: 1 }, 0)
          .fromTo(overlay, { opacity: 0 }, { opacity: 0.6 }, 0);
        }
      });
    }, groupRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [children]);

  return (
    <div className="parallax-hero-group" ref={groupRef}>
      {children}
    </div>
  );
}

ParallaxHeroGroup.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ParallaxHeroGroup;
