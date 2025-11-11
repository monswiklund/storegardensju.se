import PropTypes from "prop-types";
import Masonry from "react-masonry-css";

const breakpointColumns = {
  default: 3,
  768: 2,
};

function FeaturedGallery({ images, onImageSelect }) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="featured-gallery">
      <Masonry
        breakpointCols={breakpointColumns}
        className="gallery-grid"
        columnClassName="gallery-column"
      >
        {images.map((image, index) => (
          <div
            key={image.filename ?? index}
            className="gallery-thumbnail"
            onClick={() => onImageSelect(index)}
            role="button"
            tabIndex={0}
            aria-label={`Öppna utvald bild ${index + 1} av ${images.length} i lightbox`}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onImageSelect(index);
              }
            }}
          >
            <img
              src={image.thumbnail}
              alt={image.thumbnailAlt}
              loading="eager"
            />
          </div>
        ))}
      </Masonry>
      <div className="featured-divider" aria-hidden="true" />
    </div>
  );
}

FeaturedGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      thumbnail: PropTypes.string,
      thumbnailAlt: PropTypes.string,
      description: PropTypes.string,
      filename: PropTypes.string,
    }),
  ).isRequired,
  onImageSelect: PropTypes.func.isRequired,
};

export default FeaturedGallery;
