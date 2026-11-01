import PropTypes from "prop-types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSiteCopy } from "../../../../hooks/usePageCopy";
import { FLIGHT_EASE, cancelCssAnimation, overTile, reducedMotion, settled, tilePhoto } from "../../../../utils/tileFlight.js";

function GalleryLightbox({
  isOpen,
  images,
  currentIndex,
  currentImage,
  onClose,
  onNext,
  onPrevious,
  onSelectImage,
  dialogRef,
  closeButtonRef,
  tileFor,
}) {
  const siteCopy = useSiteCopy();
  const [immersive, setImmersive] = useState(false);
  const [closing, setClosing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const thumbnailsRef = useRef(null);

  // Constants
  const MIN_SWIPE_DISTANCE = 50;

  // Sync refs safely
  useEffect(() => {
    if (containerRef.current) {
      if (typeof dialogRef === "function") {
        dialogRef(containerRef.current);
      } else if (dialogRef) {
        dialogRef.current = containerRef.current;
      }
    }
  }, [dialogRef]);

  // Lock body scroll when open (including Lenis compatibility). The scrollbar keeps its space,
  // so the page behind does not jump sideways while the photo grows out of it. A layout effect,
  // declared before the flight below, so the tile is measured where it sits once locked
  // (a full-width strip still moves when 100vw stops counting the scrollbar).
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    window.storegardenLenis?.stop();
    return () => {
      document.documentElement.style.scrollbarGutter = "";
      document.body.style.overflow = "";
      window.storegardenLenis?.start();
      setClosing(false);
    };
  }, [isOpen]);

  // With tiles to come from, the open photo leaves an empty spot in the grid it can return to.
  useEffect(() => {
    const tile = isOpen && tileFor?.(currentIndex);
    if (!tile) return undefined;
    tile.style.visibility = "hidden";
    return () => {
      tile.style.visibility = "";
    };
  }, [isOpen, currentIndex, tileFor]);

  // Grows out of the tile it was opened from; paging to the next photo keeps its fade.
  useLayoutEffect(() => {
    const image = imageRef.current;
    const tile = isOpen && tileFor?.(currentIndex);
    if (!image || !tile || reducedMotion()) return;
    cancelCssAnimation(image, "fadeIn");
    // The big file may still be on its way: the tile's own photo stands in, placed exactly as
    // object-fit: contain will place it, so nothing flashes empty mid-flight.
    const stand = tilePhoto(tile).currentSrc;
    if (!image.complete && stand) image.style.background = `url("${stand}") center / contain no-repeat`;
    const start = overTile(image, tile, { contain: true });
    if (start) image.animate([start, settled], { duration: 520, easing: FLIGHT_EASE });
    // Only on opening.
  }, [isOpen]);

  // Settles back into its tile before the lightbox goes away.
  const close = () => {
    if (closing) return;
    const image = imageRef.current;
    const tile = tileFor?.(currentIndex);
    const end = image && tile && !reducedMotion() ? overTile(image, tile, { contain: true }) : null;
    if (!end) return onClose();
    setClosing(true);
    image.animate([settled, end], { duration: 380, easing: FLIGHT_EASE, fill: "forwards" }).finished.then(onClose, onClose);
  };

  // Keep the current photo's thumbnail in view as the visitor pages through a long strip.
  useEffect(() => {
    const strip = thumbnailsRef.current;
    const thumb = strip?.children[currentIndex];
    if (!isOpen || !thumb) return;
    strip.scrollTo?.({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2 });
  }, [isOpen, currentIndex]);

  // Swipe Handlers
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe && images.length > 1) {
      onNext();
    } else if (isRightSwipe && images.length > 1) {
      onPrevious();
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setImmersive((prev) => !prev);
  };

  if (!isOpen) return null;
  if (!images || !currentImage) return null;

  const currentCount = currentIndex + 1;
  const totalCount = images.length;

  return createPortal(
    <div
      className={`gallery-model${tileFor ? " gallery-model--lift" : ""}${immersive ? " is-immersive" : ""}${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={siteCopy("ui.carousel-label")}
      ref={containerRef}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="gallery-model-content">
        {/* Top Controls */}
        <div className={`lightbox-controls ${immersive ? "is-hidden" : ""}`}>
          <span className="lightbox-counter">
            {currentCount} / {totalCount}
          </span>

          <button
            className="gallery-close-button"
            onClick={close}
            aria-label={siteCopy("ui.close")}
            ref={closeButtonRef}
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="lightbox-stage"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Previous Button */}
          {images.length > 1 && (
            <button
              type="button"
              className={`lightbox-nav lightbox-nav--prev ${
                immersive ? "is-hidden" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              aria-label={siteCopy("ui.prev-image")}
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Main Image */}
          <figure className="lightbox-image-wrapper">
            {/* Keyed so each new photo fades in instead of cutting over. */}
            <img
              key={currentImage.original}
              ref={imageRef}
              src={currentImage.original}
              alt={currentImage.originalAlt || ""}
              loading="eager"
              onClick={handleImageClick}
              className="lightbox-image animate-fade"
              // Lets CSS enlarge the photo past its file size, but only so far before it turns soft.
              style={{ "--img-w": currentImage.width, "--img-h": currentImage.height }}
            />
          </figure>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              className={`lightbox-nav lightbox-nav--next ${
                immersive ? "is-hidden" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label={siteCopy("ui.next-image")}
            >
              <ChevronRight size={36} />
            </button>
          )}
        </div>

        {/* Caption (e.g. a painting's name and artist) and thumbnails */}
        {!immersive && (images.length > 1 || currentImage.caption) && (
          <div className="lightbox-footer">
            {currentImage.caption && <p className="lightbox-caption">{currentImage.caption}</p>}
            {images.length > 1 && (
            <div className="lightbox-thumbnails" ref={thumbnailsRef}>
              {images.map((image, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={image.filename ?? idx}
                    type="button"
                    className={`lightbox-thumbnail ${
                      isActive ? "is-active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectImage(idx);
                    }}
                    aria-label={image.thumbnailAlt || image.originalAlt || `${idx + 1}`}
                    aria-current={isActive || undefined}
                  >
                    <img src={image.thumbnail} alt="" loading="lazy" />
                  </button>
                );
              })}
            </div>
            )}
            <p className="lightbox-hint mobile-only">
              {siteCopy("ui.lightbox-hint")}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

GalleryLightbox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  images: PropTypes.array.isRequired,
  currentIndex: PropTypes.number.isRequired,
  currentImage: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSelectImage: PropTypes.func.isRequired,
  dialogRef: PropTypes.any,
  closeButtonRef: PropTypes.any,
  // The grid tile showing image `index`, for the photo to grow out of and return to.
  tileFor: PropTypes.func,
};

export default GalleryLightbox;
