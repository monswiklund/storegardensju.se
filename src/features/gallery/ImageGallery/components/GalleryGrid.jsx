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
        
        // Alternating sign pattern based on index (+ vs -) so adjacent items always tilt in opposite directions
        const directionMultiplier = index % 2 === 0 ? 1 : -1;
        
        // Generate rotation magnitude between 0.8deg and 2.0deg (max 2.0deg)
        const magRand = getSeededValue(seed + "-rot-mag-" + index);
        const rotMagnitude = 0.8 + magRand * 1.2; // 0.8deg to 2.0deg max
        const rotVal = (directionMultiplier * rotMagnitude).toFixed(2);

        // Tejpbitens rotation lutar åt motsatt håll (0.5deg till 2.0deg max)
        const tapeMagRand = getSeededValue(seed + "-tape-" + index);
        const tapeRotVal = (-directionMultiplier * (0.5 + tapeMagRand * 1.5)).toFixed(2);
        const tapeWidthVal = Math.floor(getSeededValue(seed + "-width-" + index) * 16 + 60); // 60px to 76px
        
        // Vertikal förskjutning (-8px till +16px)
        const yOffsetVal = (getSeededValue(seed + "-y-" + index) * 24 - 8).toFixed(1);
        
        // Scrapbook size variations (82% to 100% width) and horizontal position within the column
        const widthVal = Math.floor(getSeededValue(seed + "-width-pct-" + index) * 18 + 82); // 82% to 100%
        const alignRand = getSeededValue(seed + "-align-" + index);
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
