import PropTypes from "prop-types";
import {
  featuredGalleryImages,
  venueIntro,
} from "../../../data/homeContent.js";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";
import "./FeaturedGallery.css";

function HomeFeaturedGallery({ onViewAll }) {
  // Only animate when visible - stops infinite animation when off-screen
  const { ref: containerRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
    triggerOnce: false, // Re-trigger to pause/resume animation
  });

  return (
    <div
      ref={containerRef}
      className={`featured-gallery-container ${isVisible ? "is-visible" : ""}`}
    >
      <div className="featured-grid">
        {featuredGalleryImages.map((image, index) => (
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
