import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

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
  categories,
  activeCategory,
  onCategoryChange,
}) {
  const [immersive, setImmersive] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  // const [isSliding, setIsSliding] = useState(false); // Animations temporarily disabled

  const containerRef = useRef(null);
  const imageRef = useRef(null);

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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset sliding state on image change
  // useEffect(() => {
  //   setIsSliding(true);
  //   const timer = setTimeout(() => setIsSliding(false), 300);
  //   return () => clearTimeout(timer);
  // }, [currentIndex]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "Escape":
          onClose();
          break;
        case " ": // Spacebar
          e.preventDefault();
          setImmersive((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrevious, onClose]);

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

  return (
    <div
      className={`gallery-model ${immersive ? "is-immersive" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-heading"
      ref={containerRef}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gallery-model-content">
        <div className="sr-only">
          Bildgalleri med {totalCount} bilder. Använd pilarna eller swipa för
          att navigera. Tryck på bilden för helskärm.
        </div>

        {/* Top Controls */}
        <div className={`lightbox-controls ${immersive ? "is-hidden" : ""}`}>
          <div className="lightbox-header-left">
            <span className="lightbox-counter">
              {currentCount} / {totalCount}
            </span>
            {categories && onCategoryChange && (
              <div className="lightbox-categories desktop-only">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`lightbox-category-btn ${
                      activeCategory === cat.id ? "is-active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeCategory !== cat.id) {
                        onCategoryChange(cat.id);
                      }
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="gallery-close-button"
            onClick={onClose}
            aria-label="Stäng bildgalleri"
            ref={closeButtonRef}
          >
            ×
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
              aria-label="Föregående bild"
            >
              ‹
            </button>
          )}

          {/* Main Image */}
          <figure className="lightbox-image-wrapper">
            <img
              ref={imageRef}
              src={currentImage.original}
              alt={currentImage.originalAlt || "Bild i galleriet"}
              loading="eager"
              onClick={handleImageClick}
              className="lightbox-image"
              style={{ opacity: 1 }} // Force visibility
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
              aria-label="Nästa bild"
            >
              ›
            </button>
          )}
        </div>

        {/* Bottom Thumbnails */}
        {!immersive && images.length > 1 && (
          <div className="lightbox-footer">
            {/* Mobile Categories (situated above thumbnails) */}
            {categories && onCategoryChange && (
              <div className="lightbox-categories mobile-only">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`lightbox-category-btn ${
                      activeCategory === cat.id ? "is-active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeCategory !== cat.id) {
                        onCategoryChange(cat.id);
                      }
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            <div className="lightbox-thumbnails" role="list">
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
                    aria-label={`Gå till bild ${idx + 1}`}
                    aria-current={isActive || undefined}
                  >
                    <img src={image.thumbnail} alt="" loading="lazy" />
                  </button>
                );
              })}
            </div>
            <p className="lightbox-hint mobile-only">
              Swipa för att bläddra • Tryck för helskärm
            </p>
          </div>
        )}
      </div>
    </div>
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
  activeCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  categories: PropTypes.array,
  dialogRef: PropTypes.any,
  closeButtonRef: PropTypes.any,
};

export default GalleryLightbox;
