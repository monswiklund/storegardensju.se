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

const HomeHeroCarousel = () => {
  const scrollerRef = useRef(null);
  const [galleryData, setGalleryData] = useState(null);

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
