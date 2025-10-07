import PropTypes from "prop-types";
import { featuredGalleryImages, venueIntro } from "../../../data/homeContent.js";
import "./FeaturedGalleryStyles.css";

function FeaturedGallery({ onViewAll }) {

  return (
    <div className="featured-gallery-container">
      <div className="featured-grid">
        {featuredGalleryImages.map((image, index) => (
          <div
            key={index}
            className={`featured-item featured-item-${index + 1}`}
            onClick={onViewAll}
            role="button"
            tabIndex={0}
            aria-label={`Visa alla bilder - ${image.alt}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onViewAll();
              }
            }}
          >
            <img src={image.src} alt={image.alt} loading="eager" />
            <div className="featured-text-overlay">
              <h3 className="featured-title">{venueIntro.title}</h3>
              <p className="featured-subtitle">
                {venueIntro.description}
              </p>
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

FeaturedGallery.propTypes = {
  onViewAll: PropTypes.func.isRequired,
};

export default FeaturedGallery;
