import { useState, useMemo, useCallback } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "./ImageGalleryStyles.css";

function StoregardensImageGallery() {
    // Memoize expensive image data generation
    const images = useMemo(() => {
        const imageFilenames = Array.from({ length: 20 }, (_, i) => `slide${i + 1}.jpg`);
        
        // Function to assign subtle size variations
        const getRandomSize = (index) => {
            const sizePatterns = [
                'small', 'medium', 'small', 'small', 'large', 'small',
                'medium', 'small', 'small', 'medium', 'small', 'large',
                'small', 'small', 'medium', 'small', 'small', 'large',
                'medium', 'small'
            ];
            return sizePatterns[index % sizePatterns.length];
        };
        
        return imageFilenames.map((filename, index) => ({
            original: `/images/slides/${filename}`,
            thumbnail: `/images/slides/${filename}`,
            description: `Bild ${index + 1} från Storegården 7`,
            originalAlt: `Bild ${index + 1}`,
            thumbnailAlt: `Miniatyr ${index + 1}`,
            sizeClass: getRandomSize(index)
        }));
    }, []);

    const [showAllImages, setShowAllImages] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const toggleAllImages = useCallback(() => {
        setShowAllImages(!showAllImages);
    }, [showAllImages]);

    const openLightbox = useCallback((index) => {
        setLightboxIndex(index);
        setShowLightbox(true);
    }, []);

    const closeLightbox = useCallback(() => {
        setShowLightbox(false);
    }, []);

    return (
        <div className="storegarden-gallery">
            {/* Initial thumbnail grid - first 6 images */}
            <div className="gallery-grid">
                {images.slice(0, 6).map((image, index) => (
                    <div
                        key={index}
                        className={`gallery-thumbnail gallery-thumbnail--${image.sizeClass}`}
                        onClick={() => openLightbox(index)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Öppna bild ${index + 1} av ${images.length} i lightbox`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openLightbox(index);
                            }
                        }}
                    >
                        <img
                            src={image.thumbnail}
                            alt={image.thumbnailAlt}
                            loading="eager"
                        />
                    </div>
                ))}
            </div>

            {/* Show more/less button */}
            <button
                className="show-more-button"
                onClick={toggleAllImages}
                aria-expanded={showAllImages}
                aria-controls="expanded-gallery"
                aria-label={showAllImages ? 'Dölj utökade galleri bilder' : `Visa alla ${images.length} bilder i galleriet`}
            >
                {showAllImages ? 'Dölj bilder' : `Visa alla bilder (${images.length})`}
            </button>

            {/* Expanded grid - remaining images */}
            {showAllImages && (
                <div className="gallery-grid expanded-grid" id="expanded-gallery">
                    {images.slice(6).map((image, index) => (
                        <div
                            key={index + 6}
                            className={`gallery-thumbnail gallery-thumbnail--${image.sizeClass}`}
                            onClick={() => openLightbox(index + 6)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Öppna bild ${index + 7} av ${images.length} i lightbox`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    openLightbox(index + 6);
                                }
                            }}
                        >
                            <img
                                src={image.thumbnail}
                                alt={image.thumbnailAlt}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal - only when clicking on individual images */}
            {showLightbox && (
                <div 
                    className="gallery-modal" 
                    role="dialog" 
                    aria-modal="true" 
                    aria-labelledby="gallery-heading"
                    aria-describedby="gallery-description"
                >
                    <div className="gallery-modal-content">
                        <div id="gallery-description" className="sr-only">
                            Bildgalleri med {images.length} bilder. Använd pilknapparna för att navigera, ESC för att stänga.
                        </div>
                        <button
                            className="gallery-close-button"
                            onClick={closeLightbox}
                            aria-label="Stäng bildgalleri"
                            title="Stäng lightbox (ESC)"
                        >
                            ×
                        </button>
                        <ImageGallery
                            items={images}
                            startIndex={lightboxIndex}
                            showThumbnails={true}
                            showFullscreenButton={true}
                            showPlayButton={false}
                            showIndex={true}
                            showBullets={false}
                            infinite={true}
                            slideDuration={300}
                            slideInterval={2000}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default StoregardensImageGallery;