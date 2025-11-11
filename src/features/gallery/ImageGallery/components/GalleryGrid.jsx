import PropTypes from "prop-types";
import Masonry from "react-masonry-css";

const breakpointColumns = {
  default: 3,
  768: 2,
};

function GalleryGrid({ images, isLoading, onImageSelect, categoryName }) {
  if (isLoading) {
    return (
      <Masonry
        breakpointCols={breakpointColumns}
        className="gallery-grid"
        columnClassName="gallery-column"
      >
        {[...Array(6)].map((_, index) => (
          <div key={index} className="gallery-thumbnail skeleton-item">
            <div
              className="skeleton-image"
              style={{ height: `${200 + (index % 3) * 50}px` }}
            />
          </div>
        ))}
      </Masonry>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="gallery-grid"
      columnClassName="gallery-column"
    >
      {images.slice(0, 6).map((image, index) => (
        <div
          key={index}
          className="gallery-thumbnail"
          onClick={() => onImageSelect(index)}
          role="button"
          tabIndex={0}
          aria-label={`Öppna bild ${index + 1} av ${images.length} i lightbox`}
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
  );
}

GalleryGrid.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      thumbnail: PropTypes.string,
      thumbnailAlt: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onImageSelect: PropTypes.func.isRequired,
  categoryName: PropTypes.string,
};

GalleryGrid.defaultProps = {
  categoryName: "Alla",
};

export default GalleryGrid;
