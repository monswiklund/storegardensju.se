import PropTypes from "prop-types";
import Masonry from "react-masonry-css";

const breakpointColumns = {
  default: 3,
  768: 2,
};

function GalleryGrid({ images, onImageSelect }) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="gallery-grid"
      columnClassName="gallery-column"
    >
      {images.map((image, index) => (
        <div
          key={image.filename || image.original || index}
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
            loading={index < 6 ? "eager" : "lazy"}
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
      filename: PropTypes.string,
      original: PropTypes.string,
    })
  ).isRequired,
  onImageSelect: PropTypes.func.isRequired,
};

export default GalleryGrid;
