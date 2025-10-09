import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
      0,
    );
  }

  if (overlay) {
    timeline.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.4, ease: "none" },
      0,
    );
  }

  if (background) {
    timeline.fromTo(
      background,
      { scale: 1 },
      { scale: scaleTarget, duration: 1, ease: "none" },
      0,
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

    const mediaMatch = ScrollTrigger.matchMedia();

    mediaMatch.add("(min-width: 769px)", () => {
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

    mediaMatch.add("(max-width: 768px)", () => {
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

    ScrollTrigger.refresh();

    return () => {
      mediaMatch.revert();
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
