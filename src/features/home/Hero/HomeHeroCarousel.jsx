import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import "./Hero.css";
import { useSiteCopy } from "../../../hooks/usePageCopy.js";
import { fetchGalleryCategories } from "../../../services/galleryService";
import {
  isAllGalleryCategory,
  normalizeGalleryData,
} from "../../gallery/normalizeGalleryData";
import GalleryLightbox from "../../gallery/ImageGallery/components/GalleryLightbox";
import useGalleryLightbox from "../../gallery/ImageGallery/hooks/useGalleryLightbox";
import "../../gallery/ImageGallery/Gallery.css";

// A press that travels further than this was a drag along the strip, not a tap on a print.
const TAP_SLOP = 6;

// Auto-scroll speed (px/frame ~60fps). Idle time before resume after interaction.
const SCROLL_SPEED = 0.25;
const HOME_CAROUSEL_IMAGE_LIMIT = 20;

// The gallery's own selection when the CMS has one: one photo per room and angle, instead of
// the first twenty of "Alla bilder", which open with several near-identical shots of the bar.
export const getHomeCarouselSlides = (galleryData) => {
  const normalized = normalizeGalleryData(galleryData);
  const source =
    normalized.categories.find((category) => category.id === "utvalda") ||
    normalized.categories.find(isAllGalleryCategory);

  return (source?.images || [])
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

  // A print opens big and grows out of its frame; the strip holds still until it is back.
  const lightboxImages = useMemo(
    () => slides.map((src) => ({ original: src, thumbnail: src, filename: src, originalAlt: "" })),
    [slides],
  );
  const lightbox = useGalleryLightbox(lightboxImages, "hem");
  const isLightboxOpenRef = useRef(false);
  isLightboxOpenRef.current = lightbox.isOpen;
  const pressRef = useRef(null);
  const openedRef = useRef(null);

  // The strip repeats every print once (addAnimation), so the photo returns to the copy it came
  // from, or for another photo to the copy nearest the middle of the screen.
  const tileFor = useCallback((index) => {
    const opened = openedRef.current;
    if (opened?.dataset.slide === String(index)) return opened.querySelector("img");
    const middle = window.innerWidth / 2;
    const copies = [...(scrollerRef.current?.querySelectorAll(`[data-slide="${index}"]`) || [])];
    const distance = (node) => {
      const rect = node.getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - middle);
    };
    return copies.sort((a, b) => distance(a) - distance(b))[0]?.querySelector("img") || null;
  }, []);

  const openPrint = (event) => {
    const press = pressRef.current;
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > TAP_SLOP) return;
    // A mouse drag captures the pointer on the strip, so the print is found under the click.
    const print = document.elementFromPoint(event.clientX, event.clientY)?.closest(".hero-carousel-item");
    if (!print || !scrollerRef.current?.contains(print)) return;
    openedRef.current = print;
    lightbox.openLightbox(Number(print.dataset.slide));
  };

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
        isLightboxOpenRef.current ||
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
    pressRef.current = { x: e.clientX, y: e.clientY };
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
        onClick={openPrint}
      >
        <div className="hero-carousel-inner">
          {slides.map((src, index) => (
            <div className="hero-carousel-item" key={index} data-slide={index}>
              <img
                src={src}
                alt=""
                draggable={false}
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
      <GalleryLightbox
        isOpen={lightbox.isOpen}
        images={lightboxImages}
        currentIndex={lightbox.currentIndex}
        currentImage={lightbox.currentImage}
        onClose={lightbox.closeLightbox}
        onNext={lightbox.goToNextImage}
        onPrevious={lightbox.goToPreviousImage}
        onSelectImage={lightbox.goToImage}
        dialogRef={lightbox.dialogRef}
        closeButtonRef={lightbox.closeButtonRef}
        tileFor={tileFor}
      />
    </div>
  );
};

export default HomeHeroCarousel;
