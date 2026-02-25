import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Responsive multipliers for wrapper height calculation
const WRAPPER_HEIGHT_MULTIPLIERS = {
  desktop: 1.3, // 130% of viewport height
  tablet: 1.5, // 150% for tablets
  mobileLandscape: 1.85,
  mobilePortrait: 1.8,
  smallMobile: 1.9,
};

const getWrapperHeightMultiplier = () => {
  const width = window.innerWidth;
  const isPortrait = window.innerHeight > window.innerWidth;

  if (width <= 480) return WRAPPER_HEIGHT_MULTIPLIERS.smallMobile;
  if (width <= 768 && isPortrait)
    return WRAPPER_HEIGHT_MULTIPLIERS.mobilePortrait;
  if (width <= 768) return WRAPPER_HEIGHT_MULTIPLIERS.mobileLandscape;
  if (width <= 1024) return WRAPPER_HEIGHT_MULTIPLIERS.tablet;
  return WRAPPER_HEIGHT_MULTIPLIERS.desktop;
};

const calculateWrapperHeight = (heroElement) => {
  const viewportHeight = window.innerHeight;
  const multiplier = getWrapperHeightMultiplier();
  // Use viewport height as base, with multiplier for scroll space
  return Math.max(
    viewportHeight * multiplier,
    heroElement.offsetHeight * multiplier
  );
};

const createTimeline = ({
  wrapper,
  hero,
  content,
  overlay,
  background,
  scaleTarget,
}) => {
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      pin: hero,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  if (content) {
    timeline.fromTo(
      content,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "none" },
      0
    );
  }

  if (overlay) {
    timeline.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.4, ease: "none" },
      0
    );
  }

  if (background) {
    timeline.fromTo(
      background,
      { scale: 1 },
      { scale: scaleTarget, duration: 1, ease: "none" },
      0
    );
  }

  return timeline;
};

function useParallaxHeroAnimation({ isEnabled }) {
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const overlayRef = useRef(null);
  const backgroundRef = useRef(null);

  useLayoutEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    const wrapper = wrapperRef.current;
    const hero = heroRef.current;
    if (!wrapper || !hero) {
      return undefined;
    }

    const content = contentRef.current;
    const overlay = overlayRef.current;
    const background = backgroundRef.current;

    // Calculate and set dynamic wrapper height
    const updateWrapperHeight = () => {
      const height = calculateWrapperHeight(hero);
      wrapper.style.height = `${height}px`;
      wrapper.style.minHeight = `${height}px`;
    };

    updateWrapperHeight();

    // Use modern gsap.matchMedia() instead of deprecated ScrollTrigger.matchMedia()
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      updateWrapperHeight();
      const timeline = createTimeline({
        wrapper,
        hero,
        content,
        overlay,
        background,
        scaleTarget: 1.1,
      });

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });

    mm.add("(max-width: 768px)", () => {
      updateWrapperHeight();
      const timeline = createTimeline({
        wrapper,
        hero,
        content,
        overlay,
        background,
        scaleTarget: 1.05,
      });

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });

    // Handle resize for dynamic height updates
    const handleResize = () => {
      updateWrapperHeight();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", handleResize);
      mm.revert();
    };
  }, [isEnabled]);

  return {
    wrapperRef,
    heroRef,
    contentRef,
    overlayRef,
    backgroundRef,
  };
}

export default useParallaxHeroAnimation;
