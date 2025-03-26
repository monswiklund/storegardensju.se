// ExpandableImageGallery.jsx
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

function ExpandableImageGallery() {
    // State for tracking if gallery is expanded
    const [isExpanded, setIsExpanded] = useState(false);
    // State for lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    // State for showing loading status
    const [initialImagesLoaded, setInitialImagesLoaded] = useState(false);

    // All image filenames (without dynamic import)
    const imageFilenames = Array.from({ length: 24 }, (_, i) => `slide${i + 1}.jpg`);

    // Helper function to assign subtle size variations
    const assignImageSize = (index) => {
        // Simple pattern with just three size variations
        if (index % 5 === 0) {
            return "large";
        } else if (index % 3 === 0) {
            return "medium";
        } else {
            return "small";
        }
    };

    // Generate image data with subtle size variations
    const allImages = imageFilenames.map((filename, index) => {
        return {
            src: `/images/slides/${filename}`,
            alt: `Bild ${index + 1}`,
            index: index + 1,
            filename,
            sizeClass: assignImageSize(index)
        };
    });

    // Separate visible and hidden images
    const visibleImages = allImages.slice(0, 6);
    const expandedImages = allImages.slice(4);

    // Function to load initial images
    useEffect(() => {
        const preloadInitialImages = () => {
            const imagePromises = visibleImages.map(image => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = image.src;
                    img.onload = resolve;
                    img.onerror = reject;
                });
            });

            Promise.all(imagePromises)
                .then(() => setInitialImagesLoaded(true))
                .catch(error => {
                    console.error('Error loading initial images:', error);
                    setInitialImagesLoaded(true);
                });
        };

        preloadInitialImages();
    }, []);

    // Function to toggle expanded mode
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Lightbox functions
    const openLightbox = (index, isFromExpanded = false) => {
        const adjustedIndex = isFromExpanded ? index + visibleImages.length - 2 : index;
        setActiveImage(adjustedIndex);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const goPrev = (e) => {
        e.stopPropagation();
        setActiveImage((prev) =>
            prev === 0 ? allImages.length - 1 : prev - 1
        );
    };

    const goNext = (e) => {
        e.stopPropagation();
        setActiveImage((prev) =>
            prev === allImages.length - 1 ? 0 : prev + 1
        );
    };

    // Show loading indicator while images are loading
    if (!initialImagesLoaded) {
        return (
            <div className="loading-container" style={{ textAlign: 'center', padding: '20px' }}>
                <div className="loading-spinner"></div>
                <p>Laddar bilder...</p>
            </div>
        );
    }

    return (
        <div className="gallery-container">
            {/* First section with visible images */}
            <div className="gallery-grid">
                {visibleImages.map((image, index) => (
                    <div
                        key={`visible-${index}`}
                        className={`gallery-item ${image.sizeClass}`}
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="gallery-image"
                            loading="eager"
                        />
                        <div className="gallery-image-overlay"></div>
                    </div>
                ))}
            </div>

            {/* Show button to expand only if there are more images */}
            {expandedImages.length > 0 && (
                <button
                    className="expand-button"
                    onClick={toggleExpand}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp size={20} /> Dölj bilder
                        </>
                    ) : (
                        <>
                            <ChevronDown size={20} /> Visa fler bilder ({expandedImages.length})
                        </>
                    )}
                </button>
            )}

            {/* Expanded section with remaining images */}
            <div className={`expandable-section ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <>
                        <div className="gallery-grid">
                            {expandedImages.map((image, index) => (
                                <div
                                    key={`expanded-${index}`}
                                    className={`gallery-item ${image.sizeClass}`}
                                    onClick={() => openLightbox(index, true)}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="gallery-image"
                                        loading="lazy"
                                    />
                                    <div className="gallery-image-overlay"></div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="close-expanded-button"
                            onClick={toggleExpand}
                        >
                            <X size={16} /> Stäng
                        </button>
                    </>
                )}
            </div>

            {/* Lightbox for full-size images */}
            {lightboxOpen && (
                <div className="lightbox">
                    <div className="lightbox-overlay" onClick={closeLightbox}></div>
                    <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
                    <div className="lightbox-content-container">
                        <button className="lightbox-arrow lightbox-prev" onClick={goPrev}>&lt;</button>
                        <div className="lightbox-content">
                            <img
                                src={allImages[activeImage].src}
                                alt={allImages[activeImage].alt}
                                className="lightbox-image"
                                loading="lazy"
                            />
                            <div className="image-counter">{activeImage + 1} / {allImages.length}</div>
                        </div>
                        <button className="lightbox-arrow lightbox-next" onClick={goNext}>&gt;</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpandableImageGallery;