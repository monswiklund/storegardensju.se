import PropTypes from "prop-types";
import "./FeaturedGalleryStyles.css";

function FeaturedGallery({ onViewAll }) {
  const featuredImages = [
    { src: "/images/evenemang/slide4.jpg", alt: "Evenemang" },
  ];

  return (
    <div className="featured-gallery-section">
      <div className="featured-gallery-container">
        <div className="featured-grid">
          {featuredImages.map((image, index) => (
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
                <h3 className="featured-title">Om platsen</h3>
                <p className="featured-subtitle">
                  Storegården 7 ligger bara 15 minuter utanför Lidköpings centrum i en lantlig omgivning,
                  långt från stadens brus. En plats där dina gäster kan koppla av och uppleva något unikt.
                  Vi har tagit vara på den gamla gårdens charm och kombinerat den med moderna bekvämligheter.
                </p>
              </div>
              <div className="featured-overlay">
                <span className="view-more-text">Se alla bilder</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

FeaturedGallery.propTypes = {
  onViewAll: PropTypes.func.isRequired,
};

export default FeaturedGallery;
