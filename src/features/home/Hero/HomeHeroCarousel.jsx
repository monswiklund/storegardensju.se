import { useEffect, useRef, useMemo } from "react";
import "./Hero.css";
import galleryData from "../../../data/galleryCategories.json";
import galleryOrder from "../../../data/gallery-order.json";

const HomeHeroCarousel = () => {
  const scrollerRef = useRef(null);

  // Get featured images from gallery data
  const slides = useMemo(() => {
    if (!galleryOrder?.featured || !galleryData?.categories) return [];

    const allaCategory = galleryData.categories.find((c) => c.id === "alla");
    if (!allaCategory) return [];

    return galleryOrder.featured
      .map((filename) => {
        const img = allaCategory.images.find((i) => i.filename === filename);
        return img ? img.path : null;
      })
      .filter(Boolean);
  }, []);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    const scroller = scrollerRef.current;
    if (scroller && !scroller.getAttribute("data-animated")) {
      scroller.setAttribute("data-animated", true);

      // We need to duplicate the content to create the infinite scrolling effect
      const scrollerInner = scroller.querySelector(".hero-carousel-inner");
      const scrollerContent = Array.from(scrollerInner.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute("aria-hidden", true);
        scrollerInner.appendChild(duplicatedItem);
      });
    }
  }

  return (
    <div className="hero-carousel" ref={scrollerRef}>
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
