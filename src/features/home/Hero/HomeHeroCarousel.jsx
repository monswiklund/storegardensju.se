import { useEffect, useRef, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import "./Hero.css";
import { useSiteCopy } from "../../../hooks/usePageCopy.js";
import { fetchGalleryCategories } from "../../../services/galleryService";
import {
  isAllGalleryCategory,
  normalizeGalleryData,
} from "../../gallery/normalizeGalleryData";

// Auto-scroll speed (px/frame ~60fps). Idle time before resume after interaction.
const SCROLL_SPEED = 0.25;
const HOME_CAROUSEL_IMAGE_LIMIT = 20;

export const getHomeCarouselSlides = (galleryData) => {
  const normalized = normalizeGalleryData(galleryData);
  const allImagesCategory = normalized.categories.find(isAllGalleryCategory);

  return (allImagesCategory?.images || [])
    .map((image) => image.path)
    .filter(Boolean)
    .slice(0, HOME_CAROUSEL_IMAGE_LIMIT);
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const HomeHeroCarousel = () => {
  const siteCopy = useSiteCopy();
  const scrollerRef = useRef(null);
  const [galleryData, setGalleryData] = useState(null);
  // Stopped by the visitor's button or their reduced-motion setting.
  const [isStopped, setIsStopped] = useState(prefersReducedMotion);
  const isStoppedRef = useRef(isStopped);
  // Hover, keyboard focus or off-screen: a temporary hold, not a choice.
  const isHeldRef = useRef(false);
  const isOffscreenRef = useRef(false);
  const isDraggingRef = useRef(false);
  const posRef = useRef(0); // fractional scroll accumulator (scrollLeft may round to int)

  useEffect(() => {
    let isMounted = true;
    fetchGalleryCategories()
      .then((data) => {
        if (isMounted) {
          setGalleryData(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setGalleryData(null);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const slides = useMemo(
    () => getHomeCarouselSlides(galleryData),
    [galleryData],
  );

  useEffect(() => {
    addAnimation();
  }, [slides.length]);

  useEffect(() => {
    isStoppedRef.current = isStopped;
  }, [isStopped]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      isOffscreenRef.current = !entry.isIntersecting;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [slides.length]);

  // Continuous auto-scroll (marquee band) driven in JS so the track stays
  // natively scrollable/draggable. Pauses while the user interacts, wraps at
  // the halfway point (content is duplicated by addAnimation).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;

    let rafId;
    const tick = () => {
      const paused =
        isDraggingRef.current ||
        isStoppedRef.current ||
        isHeldRef.current ||
        isOffscreenRef.current;
      if (!paused) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          posRef.current += SCROLL_SPEED;
          if (posRef.current >= half) posRef.current -= half;
          el.scrollLeft = posRef.current;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [slides.length]);

  // Drag-to-scroll; touch pauses auto-scroll so it cannot fight the finger.
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    isDraggingRef.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
    posRef.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const el = scrollerRef.current;
    const half = el.scrollWidth / 2;
    let next = dragStartScroll.current - (e.clientX - dragStartX.current);
    if (half > 0) {
      if (next >= half) next -= half;
      else if (next < 0) next += half;
    }
    el.scrollLeft = next;
    posRef.current = next; // keep auto-scroll accumulator in sync
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    const el = scrollerRef.current;
    isDraggingRef.current = true;
    dragStartX.current = touch.clientX;
    dragStartY.current = touch.clientY;
    dragStartScroll.current = el.scrollLeft;
    posRef.current = el.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - dragStartX.current;
    const dy = touch.clientY - dragStartY.current;
    if (Math.abs(dx) < Math.abs(dy)) return;

    e.preventDefault();
    const el = scrollerRef.current;
    const half = el.scrollWidth / 2;
    let next = dragStartScroll.current - dx;
    if (half > 0) {
      if (next >= half) next -= half;
      else if (next < 0) next += half;
    }
    el.scrollLeft = next;
    posRef.current = next;
  };

  const endDrag = () => {
    isDraggingRef.current = false;
  };

  function addAnimation() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const scrollerInner = scroller.querySelector(".hero-carousel-inner");
    if (!scrollerInner) return;

    scrollerInner
      .querySelectorAll('[aria-hidden="true"]')
      .forEach((node) => node.remove());

    scroller.removeAttribute("data-animated");
    scroller.setAttribute("data-animated", true);

    const scrollerContent = Array.from(scrollerInner.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });
  }

  if (slides.length === 0) return null;

  const hold = () => {
    isHeldRef.current = true;
  };
  const release = () => {
    isHeldRef.current = false;
    posRef.current = scrollerRef.current?.scrollLeft ?? posRef.current;
  };

  return (
    <div className="hero-carousel-wrap">
      <div
        className="hero-carousel"
        ref={scrollerRef}
        role="region"
        aria-label={siteCopy("ui.carousel-label")}
        tabIndex={0}
        onMouseEnter={hold}
        onMouseLeave={release}
        onFocus={hold}
        onBlur={release}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endDrag}
        onTouchCancel={endDrag}
      >
        <div className="hero-carousel-inner">
          {slides.map((src, index) => (
            <div className="hero-carousel-item" key={index}>
              <img
                src={src}
                alt=""
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="hero-carousel-toggle"
        aria-pressed={isStopped}
        onClick={() => {
          posRef.current = scrollerRef.current?.scrollLeft ?? posRef.current;
          setIsStopped((stopped) => !stopped);
        }}
      >
        {isStopped ? (
          <Play size={14} aria-hidden="true" />
        ) : (
          <Pause size={14} aria-hidden="true" />
        )}
        {isStopped
          ? siteCopy("ui.carousel-play")
          : siteCopy("ui.carousel-pause")}
      </button>
    </div>
  );
};

export default HomeHeroCarousel;
