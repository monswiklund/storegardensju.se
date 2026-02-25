import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  featuredGalleryImages,
  venueIntro,
} from "../../../data/homeContent.js";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";
import "./FeaturedGallery.css";
import { fetchGalleryCategories } from "../../../services/galleryService";
import staticGalleryData from "../../../data/galleryCategories.json";
import galleryOrder from "../../../data/gallery-order.json";

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

function HomeFeaturedGallery({ onViewAll }) {
  // Only animate when visible - stops infinite animation when off-screen
  const { ref: containerRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
    triggerOnce: false, // Re-trigger to pause/resume animation
  });

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

  const featuredImages = useMemo(() => {
    const normalized = normalizeGalleryData(galleryData);
    const featuredList =
      normalized.featured || galleryOrder?.featured || [];
    const allaCategory = normalized.categories.find((c) => c.id === "alla");
    if (!allaCategory || !featuredList) return featuredGalleryImages;

    const fromApi = featuredList
      .map((featuredId) => {
        const img = allaCategory.images.find(
          (i) =>
            i.filename === featuredId ||
            i.id === featuredId ||
            i.storageKey === featuredId
        );
        if (!img) return null;
        return {
          src: img.path,
          alt: img.displayName || img.title || img.alt || "Bild",
        };
      })
      .filter(Boolean);

    return fromApi.length ? fromApi : featuredGalleryImages;
  }, [galleryData]);

  return (
    <div
      ref={containerRef}
      className={`featured-gallery-container ${isVisible ? "is-visible" : ""}`}
    >
      <div className="featured-grid">
        {featuredImages.map((image, index) => (
          <div
            key={image.src}
            className={`featured-item featured-item-${index + 1}`}
            onClick={onViewAll}
            role="button"
            tabIndex={0}
            aria-label={`Visa alla bilder - ${image.alt}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewAll();
              }
            }}
          >
            <img src={image.src} alt={image.alt} loading="eager" />
            <div className="featured-text-overlay">
              <h3 className="featured-title">{venueIntro.title}</h3>
              <p className="featured-subtitle">{venueIntro.description}</p>
            </div>
            <div className="featured-overlay">
              <span className="view-more-text">Se alla bilder</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

HomeFeaturedGallery.propTypes = {
  onViewAll: PropTypes.func.isRequired,
};

export default HomeFeaturedGallery;
