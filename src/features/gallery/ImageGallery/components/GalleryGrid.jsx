import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import Masonry from "react-masonry-css";
import { useSiteCopy } from "../../../../hooks/usePageCopy.js";

const IMAGE_BATCH_SIZE = 12;

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

const getDirectionMultiplier = (index, columnCount) => {
  const row = Math.floor(index / columnCount);
  const column = index % columnCount;
  return (row + column) % 2 === 0 ? 1 : -1;
};

function GalleryGrid({
  images,
  onImageSelect,
}) {
  const siteCopy = useSiteCopy();
  const [visibleCount, setVisibleCount] = useState(IMAGE_BATCH_SIZE);
  const sentinelRef = useRef(null);

  // Reset batch size if images change (e.g. category switch)
  useEffect(() => {
    setVisibleCount(IMAGE_BATCH_SIZE);
  }, [images]);

  useEffect(() => {
    if (visibleCount >= images.length) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisibleCount(images.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + IMAGE_BATCH_SIZE, images.length)
          );
        }
      },
      {
        rootMargin: "350px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [visibleCount, images.length]);

  const visibleImages = images.slice(0, visibleCount);
  const remainingCount = images.length - visibleImages.length;

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="gallery-grid"
        columnClassName="gallery-column"
      >
        {visibleImages.map((image, index) => {
          const seed = image.filename || image.original || String(index);

          // Use a checkerboard direction for each responsive column layout.
          const threeColumnDirection = getDirectionMultiplier(index, 3);
          const twoColumnDirection = getDirectionMultiplier(index, 2);

          // Generate rotation magnitude between 0.8deg and 2.0deg.
          const magRand = getSeededValue(seed + "-rot-mag-" + index);
          const rotMagnitude = 0.8 + magRand * 1.2;
          const threeColumnRotation = (
            threeColumnDirection * rotMagnitude
          ).toFixed(2);
          const twoColumnRotation = (
            twoColumnDirection * rotMagnitude
          ).toFixed(2);

          // Keep the tape tilted in the opposite direction from its image.
          const tapeMagRand = getSeededValue(seed + "-tape-" + index);
          const tapeRotMagnitude = 0.5 + tapeMagRand * 1.5;
          const threeColumnTapeRotation = (
            -threeColumnDirection * tapeRotMagnitude
          ).toFixed(2);
          const twoColumnTapeRotation = (
            -twoColumnDirection * tapeRotMagnitude
          ).toFixed(2);
          const tapeWidthVal = Math.floor(
            getSeededValue(seed + "-width-" + index) * 16 + 60
          ); // 60px to 76px

          // Vertikal förskjutning (-8px till +16px)
          const yOffsetVal = (
            getSeededValue(seed + "-y-" + index) * 24 -
            8
          ).toFixed(1);

          // Keep wider cards in the two-column layout while preserving scrapbook variation.
          const widthRand = getSeededValue(seed + "-width-pct-" + index);
          const threeColumnWidth = Math.floor(widthRand * 18 + 82);
          const twoColumnWidth = Math.floor(widthRand * 8 + 92);
          const alignRand = getSeededValue(seed + "-align-" + index);
          const alignVal =
            alignRand < 0.33
              ? "flex-start"
              : alignRand < 0.66
                ? "center"
                : "flex-end";

          return (
            <div
              key={image.filename || image.original || index}
              className="gallery-thumbnail"
              onClick={() => onImageSelect(index)}
              role="button"
              tabIndex={0}
              aria-label={image.alt || `${index + 1}`}
              style={{
                "--item-rotation-3-columns": `${threeColumnRotation}deg`,
                "--item-rotation-2-columns": `${twoColumnRotation}deg`,
                "--item-y-offset": `${yOffsetVal}px`,
                "--item-tape-rotation-3-columns": `${threeColumnTapeRotation}deg`,
                "--item-tape-rotation-2-columns": `${twoColumnTapeRotation}deg`,
                "--item-tape-width": `${tapeWidthVal}px`,
                "--item-width-3-columns": `${threeColumnWidth}%`,
                "--item-width-2-columns": `${twoColumnWidth}%`,
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
                src={image.galleryPath || image.original || image.thumbnail}
                alt={image.thumbnailAlt}
                width={image.width || undefined}
                height={image.height || undefined}
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          );
        })}
      </Masonry>

      {remainingCount > 0 && (
        <div
          ref={sentinelRef}
          className="gallery-scroll-sentinel"
          data-testid="gallery-scroll-sentinel"
          aria-hidden="true"
        >
          <div
            className="gallery-scroll-loader"
            aria-label={siteCopy("gallery.loading-more")}
          >
            <span className="gallery-scroll-dot" />
            <span className="gallery-scroll-dot" />
            <span className="gallery-scroll-dot" />
          </div>
        </div>
      )}
    </>
  );
}

GalleryGrid.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      thumbnail: PropTypes.string,
      thumbnailAlt: PropTypes.string,
      galleryPath: PropTypes.string,
      filename: PropTypes.string,
      original: PropTypes.string,
      width: PropTypes.number,
      height: PropTypes.number,
    })
  ).isRequired,
  onImageSelect: PropTypes.func.isRequired,
};

export default GalleryGrid;
