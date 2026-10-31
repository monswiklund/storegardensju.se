import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import Masonry from "react-masonry-css";
import { useSiteCopy } from "../../../../hooks/usePageCopy.js";

const IMAGE_BATCH_SIZE = 12;

const breakpointColumns = {
  default: 3,
  768: 2,
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
          return (
            <div
              key={image.filename || image.original || index}
              className="gallery-thumbnail"
              onClick={() => onImageSelect(index)}
              role="button"
              tabIndex={0}
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
