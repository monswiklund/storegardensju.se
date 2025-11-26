import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Shared IntersectionObserver hook for efficient visibility detection.
 * Reuses a single observer instance per unique options configuration.
 *
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection
 * @param {boolean} options.triggerOnce - Whether to unobserve after first intersection
 * @param {boolean} options.disabled - Disable the observer
 * @returns {Object} { ref, isVisible, entry }
 */

// Global observer registry - reuses observers with same options
const observerRegistry = new Map();

const getObserverKey = (options) => {
  return `${options.threshold}-${options.rootMargin}-${options.triggerOnce}`;
};

const getOrCreateObserver = (options, callback) => {
  const key = getObserverKey(options);

  if (!observerRegistry.has(key)) {
    const targets = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const targetCallback = targets.get(entry.target);
          if (targetCallback) {
            targetCallback(entry);
          }
        });
      },
      {
        threshold: options.threshold,
        rootMargin: options.rootMargin,
      }
    );

    observerRegistry.set(key, { observer, targets });
  }

  return observerRegistry.get(key);
};

function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
  disabled = false,
} = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  const handleIntersection = useCallback(
    (intersectionEntry) => {
      setEntry(intersectionEntry);

      if (intersectionEntry.isIntersecting) {
        setIsVisible(true);
        hasTriggeredRef.current = true;
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    const element = elementRef.current;

    if (!element || disabled) {
      return undefined;
    }

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return undefined;
    }

    // Fallback for browsers without IntersectionObserver
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    // If triggerOnce and already triggered, don't re-observe
    if (triggerOnce && hasTriggeredRef.current) {
      return undefined;
    }

    const options = { threshold, rootMargin, triggerOnce };
    const { observer, targets } = getOrCreateObserver(
      options,
      handleIntersection
    );

    targets.set(element, handleIntersection);
    observer.observe(element);

    return () => {
      targets.delete(element);
      observer.unobserve(element);

      // Clean up observer if no more targets
      if (targets.size === 0) {
        observer.disconnect();
        observerRegistry.delete(getObserverKey(options));
      }
    };
  }, [threshold, rootMargin, triggerOnce, disabled, handleIntersection]);

  return {
    ref: elementRef,
    isVisible,
    entry,
  };
}

export default useIntersectionObserver;
