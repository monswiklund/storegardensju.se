import { useEffect, useRef, useMemo, useState } from "react";
import "./Hero.css";
import staticGalleryData from "../../../data/galleryCategories.json";
import galleryOrder from "../../../data/gallery-order.json";
import { fetchGalleryCategories } from "../../../services/galleryService";

const normalizeGalleryData = (data) => {
  const raw = data?.categories ? data : staticGalleryData;
  let categories = (raw?.categories || []).map((category) => ({
    ...category,
    images: (category.images || []).map((image) => ({
      ...image,
      path:
        image.path ||
        image.url ||
        image.publicUrl ||
        image.storageUrl ||
        image.src ||
        "",
      displayName:
        image.displayName ||
        image.title ||
        image.alt ||
        image.filename ||
        image.id ||
        "Bild",
    })),
  }));

  const hasAll = categories.some((cat) => cat.id === "alla");
  if (!hasAll && categories.length > 0) {
    const allImages = categories.flatMap((cat) =>
      (cat.images || []).map((image) => ({ ...image, categoryId: cat.id }))
    );
    categories = [
      {
        id: "alla",
        name: "Alla bilder",
        images: allImages,
      },
      ...categories,
    ];
  }

  return {
    categories,
    featured: data?.featured || raw?.featured || null,
  };
};

// Auto-scroll speed (px/frame ~60fps). Idle time before resume after interaction.
const SCROLL_SPEED = 0.25;

const HomeHeroCarousel = () => {
  const scrollerRef = useRef(null);
  const [galleryData, setGalleryData] = useState(null);
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

  // Get featured images from gallery data
  const slides = useMemo(() => {
    const normalized = normalizeGalleryData(galleryData);
    const featuredList =
      normalized.featured || galleryOrder?.featured || [];
    if (!featuredList || !normalized?.categories) return [];

    const allaCategory = normalized.categories.find((c) => c.id === "alla");
    if (!allaCategory) return [];

    return featuredList
      .map((featuredId) => {
        const img = allaCategory.images.find(
          (i) =>
            i.filename === featuredId ||
            i.id === featuredId ||
            i.storageKey === featuredId
        );
        return img ? img.path : null;
      })
      .filter(Boolean);
  }, [galleryData]);

  useEffect(() => {
    addAnimation();
  }, [slides.length]);

  // Continuous auto-scroll (marquee band) driven in JS so the track stays
  // natively scrollable/draggable. Pauses while the user interacts, wraps at
  // the halfway point (content is duplicated by addAnimation).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;

    let rafId;
    const tick = () => {
      if (!isDraggingRef.current) {
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

  // Mouse drag-to-scroll (touch/trackpad handled natively by overflow scroll).
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType !== "mouse") return; // native scroll covers touch/pen
    const el = scrollerRef.current;
    isDraggingRef.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
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

  return (
    <div
      className="hero-carousel"
      ref={scrollerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="hero-carousel-inner">
        {slides.map((src, index) => (
          <div className="hero-carousel-item" key={index}>
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeHeroCarousel;
