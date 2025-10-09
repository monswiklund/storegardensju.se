import { useEffect, useRef, useState, useCallback } from "react";

const HIDDEN = "hidden";
const FIXED = "fixed";
const BOTTOM = "bottom";

/**
 * Controls the sticky hide button docking behaviour based on scroll position.
 */
function useDockedToggle(isExpanded) {
  const [mode, setModeState] = useState(HIDDEN);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const modeRef = useRef(HIDDEN);

  const setMode = useCallback((nextMode) => {
    if (modeRef.current === nextMode) return;
    modeRef.current = nextMode;
    setModeState(nextMode);
  }, []);

  useEffect(() => {
    if (!isExpanded) {
      setMode(HIDDEN);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const DOCK_THRESHOLD = 8;
    const topSentinel = container.querySelector(".sentinel-top");
    const bottomSentinel = container.querySelector(".sentinel-bottom");
    let topIn = false;
    let bottomIn = false;
    let resizeObserver;
    let intersectionObserver;

    const getAbsoluteTop = (node) => {
      let top = 0;
      let current = node;
      while (current) {
        top += current.offsetTop || 0;
        current = current.offsetParent;
      }
      return top;
    };

    const computeAndSet = () => {
      const node = containerRef.current;
      if (!node) return;

      const containerTop = getAbsoluteTop(node);
      const containerHeight = node.offsetHeight;
      const containerBottom = containerTop + containerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportBottom = scrollY + viewportHeight;

      if (viewportBottom < containerTop) {
        setMode(HIDDEN);
        return;
      }

      if (scrollY >= containerBottom) {
        setMode(HIDDEN);
        return;
      }

      if (viewportBottom >= containerBottom - DOCK_THRESHOLD) {
        setMode(BOTTOM);
        return;
      }

      setMode(FIXED);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          computeAndSet();
          ticking = false;
        });
      }
    };

    const onResize = () => {
      computeAndSet();
    };

    if ("IntersectionObserver" in window && topSentinel && bottomSentinel) {
      intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === topSentinel) topIn = entry.isIntersecting;
          if (entry.target === bottomSentinel) bottomIn = entry.isIntersecting;
        });

        if (!topIn && !bottomIn) {
          const containerTopAbs = getAbsoluteTop(container);
          const containerBottomAbs = containerTopAbs + container.offsetHeight;
          const currentScrollY = window.scrollY || window.pageYOffset;
          const viewportBottomEdge = currentScrollY + (window.innerHeight || document.documentElement.clientHeight);
          if (viewportBottomEdge < containerTopAbs || currentScrollY >= containerBottomAbs) {
            setMode(HIDDEN);
            return;
          }
        }

        if (bottomIn) {
          setMode(BOTTOM);
        } else if (topIn) {
          setMode(FIXED);
        }
      }, { root: null, threshold: 0 });

      intersectionObserver.observe(topSentinel);
      intersectionObserver.observe(bottomSentinel);
    }

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => computeAndSet());
      resizeObserver.observe(container);
    }

    const images = container.querySelectorAll("img");
    images.forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", computeAndSet, { once: true });
      }
    });

    setTimeout(computeAndSet, 50);
    setTimeout(computeAndSet, 200);
    setTimeout(computeAndSet, 600);
    computeAndSet();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
    };
  }, [isExpanded, setMode]);

  return {
    mode,
    containerRef,
    buttonRef,
  };
}

export default useDockedToggle;
