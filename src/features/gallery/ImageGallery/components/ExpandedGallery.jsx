import PropTypes from "prop-types";
import Masonry from "react-masonry-css";

const breakpointColumns = {
  default: 3,
  768: 2,
};

function ExpandedGallery({
  images,
  startIndex,
  totalCount,
  onImageSelect,
  categoryName,
  buttonMode,
  onToggle,
  containerRef,
  buttonRef,
}) {
  return (
    <div className="expanded-gallery-container" ref={containerRef}>
      <div className="gallery-sentinel sentinel-top" aria-hidden="true" />
      <Masonry
        breakpointCols={breakpointColumns}
        className="gallery-grid expanded-grid"
        columnClassName="gallery-column"
        id="expanded-gallery"
      >
        {images.map((image, index) => {
          const absoluteIndex = index + startIndex;
          return (
            <div
              key={absoluteIndex}
              className="gallery-thumbnail"
              onClick={() => onImageSelect(absoluteIndex)}
              role="button"
              tabIndex={0}
              aria-label={`Öppna bild ${absoluteIndex + 1} av ${totalCount} i lightbox`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onImageSelect(absoluteIndex);
                }
              }}
            >
              <img
                src={image.thumbnail}
                alt={image.thumbnailAlt}
                loading="lazy"
              />
              <div className="image-overlay">
                <span className="image-category">{categoryName ?? "Alla"}</span>
              </div>
            </div>
          );
        })}
      </Masonry>
      <div className="gallery-sentinel sentinel-bottom" aria-hidden="true" />
      <button
        ref={buttonRef}
        className={`hide-images-button ${buttonMode === "fixed" ? "is-fixed" : ""} ${buttonMode === "bottom" ? "at-bottom" : ""} ${buttonMode === "hidden" ? "is-hidden" : ""}`}
        onClick={onToggle}
        aria-label="Dölj utökade galleri bilder"
        aria-hidden={buttonMode === "hidden"}
      >
        Dölj bilder
      </button>
    </div>
  );
}

ExpandedGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      thumbnail: PropTypes.string,
      thumbnailAlt: PropTypes.string,
    }),
  ).isRequired,
  startIndex: PropTypes.number,
  totalCount: PropTypes.number,
  onImageSelect: PropTypes.func.isRequired,
  categoryName: PropTypes.string,
  buttonMode: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  containerRef: PropTypes.shape({ current: PropTypes.any }),
  buttonRef: PropTypes.shape({ current: PropTypes.any }),
};

ExpandedGallery.defaultProps = {
  startIndex: 6,
  totalCount: 0,
  categoryName: "Alla",
  containerRef: { current: null },
  buttonRef: { current: null },
};

export default ExpandedGallery;
