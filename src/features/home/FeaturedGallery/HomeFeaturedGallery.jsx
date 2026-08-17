import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  featuredGalleryImages,
} from "../../../data/homeContent.js";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";
import "./FeaturedGallery.css";
import { fetchGalleryCategories } from "../../../services/galleryService";
import galleryOrder from "../../../data/gallery-order.json";
import { normalizeGalleryData } from "../../gallery/normalizeGalleryData";
import usePageCopy from "../../../hooks/usePageCopy.js";

function HomeFeaturedGallery({ onViewAll }) {
  const copy = usePageCopy("home");
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
          alt: img.displayName || img.title || img.alt || "",
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
            aria-label={copy("venue.gallery-cta") || undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewAll();
              }
            }}
          >
            <img src={image.src} alt={image.alt} loading="eager" />
            <div className="featured-text-overlay">
              <h3 className="featured-title">
                {copy("venue.title")}
              </h3>
              <p className="featured-subtitle">
                {copy("venue.description")}
              </p>
            </div>
            <div className="featured-overlay">
              <span className="view-more-text">
                {copy("venue.gallery-cta")}
              </span>
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
