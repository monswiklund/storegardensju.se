import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSiteCopy } from "../../../../hooks/usePageCopy";

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
}) {
  const siteCopy = useSiteCopy();
  const [immersive, setImmersive] = useState(false);
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

  // Lock body scroll when open (including Lenis compatibility)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (window.storegardenLenis) {
        window.storegardenLenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      if (window.storegardenLenis) {
        window.storegardenLenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (window.storegardenLenis) {
        window.storegardenLenis.start();
      }
    };
  }, [isOpen]);

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
      className={`gallery-model ${immersive ? "is-immersive" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={siteCopy("ui.carousel-label")}
      ref={containerRef}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
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
            onClick={onClose}
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

        {/* Bottom Thumbnails */}
        {!immersive && images.length > 1 && (
          <div className="lightbox-footer">
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
};

export default GalleryLightbox;
