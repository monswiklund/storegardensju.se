import PropTypes from "prop-types";
import Masonry from "react-masonry-css";

const breakpointColumns = {
  default: 3,
  768: 2,
};

// Simple helper to get a deterministic pseudo-random value [0, 1] from a string seed
const getSeededValue = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 1000) / 1000;
};

function GalleryGrid({ images, onImageSelect }) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="gallery-grid"
      columnClassName="gallery-column"
    >
      {images.map((image, index) => {
        const seed = image.filename || image.original || String(index);
        
        // Generate deterministic styles for scrapbook look
        const rotVal = (getSeededValue(seed + "-rot") * 4 - 2).toFixed(2); // -2.0deg to +2.0deg
        const yOffsetVal = (getSeededValue(seed + "-y") * 24 - 8).toFixed(1); // -8px to +16px
        const tapeRotVal = (getSeededValue(seed + "-tape") * 6 - 3).toFixed(2); // -3.0deg to +3.0deg
        const tapeWidthVal = Math.floor(getSeededValue(seed + "-width") * 16 + 60); // 60px to 76px
        
        // Scrapbook size variations (84% to 100% width) and horizontal position within the column
        const widthVal = Math.floor(getSeededValue(seed + "-width-pct") * 16 + 84); // 84% to 100%
        const alignRand = getSeededValue(seed + "-align");
        const alignVal = alignRand < 0.33 ? "flex-start" : alignRand < 0.66 ? "center" : "flex-end";

        return (
          <div
            key={image.filename || image.original || index}
            className="gallery-thumbnail"
            onClick={() => onImageSelect(index)}
            role="button"
            tabIndex={0}
            aria-label={`Öppna bild ${index + 1} av ${images.length} i lightbox`}
            style={{
              "--item-rotation": `${rotVal}deg`,
              "--item-y-offset": `${yOffsetVal}px`,
              "--item-tape-rotation": `${tapeRotVal}deg`,
              "--item-tape-width": `${tapeWidthVal}px`,
              "--item-width": `${widthVal}%`,
              "--item-align-self": alignVal,
            }}
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
        );
      })}
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
