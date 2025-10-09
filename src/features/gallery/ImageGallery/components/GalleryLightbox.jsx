import PropTypes from "prop-types";

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
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="gallery-model"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-heading"
      aria-describedby="gallery-description"
      ref={dialogRef}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="gallery-model-content">
        <div id="gallery-description" className="sr-only">
          Bildgalleri med {images.length} bilder. Använd pilknapparna för att navigera, ESC för att stänga.
        </div>
        <button
          className="gallery-close-button"
          onClick={onClose}
          aria-label="Stäng bildgalleri"
          title="Stäng lightbox (ESC)"
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>
        {currentImage ? (
          <>
            <div className="lightbox-stage">
              {images.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav lightbox-nav--prev"
                  onClick={onPrevious}
                  aria-label="Visa föregående bild"
                >
                  ‹
                </button>
              )}
              <figure className="lightbox-image-wrapper">
                <img
                  src={currentImage.original}
                  alt={currentImage.originalAlt || currentImage.description || "Bild i galleriet"}
                  loading="eager"
                />
              </figure>
              {images.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav lightbox-nav--next"
                  onClick={onNext}
                  aria-label="Visa nästa bild"
                >
                  ›
                </button>
              )}
            </div>
            <div className="lightbox-footer">
              <span className="lightbox-counter" aria-live="polite">
                {currentIndex + 1} / {images.length}
              </span>
              {images.length > 1 && (
                <div className="lightbox-thumbnails" role="list">
                  {images.map((image, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={image.filename ?? idx}
                        type="button"
                        className={`lightbox-thumbnail ${isActive ? "is-active" : ""}`}
                        onClick={() => onSelectImage(idx)}
                        aria-label={`Gå till bild ${idx + 1} av ${images.length}`}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <img
                          src={image.thumbnail}
                          alt={image.thumbnailAlt}
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="lightbox-empty">
            <p>Inga bilder tillgängliga i denna kategori.</p>
          </div>
        )}
      </div>
    </div>
  );
}

GalleryLightbox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  images: PropTypes.arrayOf(
    PropTypes.shape({
      original: PropTypes.string,
      originalAlt: PropTypes.string,
      description: PropTypes.string,
      thumbnail: PropTypes.string,
      thumbnailAlt: PropTypes.string,
      filename: PropTypes.string,
    }),
  ).isRequired,
  currentIndex: PropTypes.number.isRequired,
  currentImage: PropTypes.shape({
    original: PropTypes.string,
    originalAlt: PropTypes.string,
    description: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSelectImage: PropTypes.func.isRequired,
  dialogRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  closeButtonRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
};

GalleryLightbox.defaultProps = {
  currentImage: null,
};

export default GalleryLightbox;
