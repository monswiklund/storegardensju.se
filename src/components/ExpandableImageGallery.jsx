// ExpandableImageGallery.jsx
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

function ExpandableImageGallery() {
    // State för att hålla reda på om galleriet är expanderat
    const [isExpanded, setIsExpanded] = useState(false);
    // State för lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    // State för att visa laddningsstatus
    const [initialImagesLoaded, setInitialImagesLoaded] = useState(false);

    // Alla bildfilnamn (utan dynamisk import)
    const imageFilenames = Array.from({ length: 24 }, (_, i) => `slide${i + 1}.jpg`);

    // Generera bilddata för synliga och dolda bilder
    const allImages = imageFilenames.map((filename, index) => ({
        src: `/src/assets/slides/${filename}`,
        alt: `Bild ${index + 1}`,
        index: index + 1,
        filename
    }));

    // Separera synliga och dolda bilder
    const visibleImages = allImages.slice(0, 3);
    const expandedImages = allImages.slice(3);

    // Funktion för att ladda de initiala bilderna
    useEffect(() => {
        // Förladda de första synliga bilderna
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
                    console.error('Fel vid laddning av initiala bilder:', error);
                    setInitialImagesLoaded(true); // Fortsätt ändå för att visa UI
                });
        };

        preloadInitialImages();
    }, []);

    // Funktion för att växla expanderat läge
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Funktioner för lightbox
    const openLightbox = (index, isFromExpanded = false) => {
        // Om bilden kommer från den expanderade delen, justera index
        const adjustedIndex = isFromExpanded ? index + visibleImages.length : index;
        setActiveImage(adjustedIndex);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Hindra scrollning när lightbox är öppen
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto'; // Återaktivera scrollning
    };

    const goPrev = (e) => {
        e.stopPropagation(); // Förhindra att klick på pilen stänger lightbox
        setActiveImage((prev) =>
            prev === 0 ? allImages.length - 1 : prev - 1
        );
    };

    const goNext = (e) => {
        e.stopPropagation(); // Förhindra att klick på pilen stänger lightbox
        setActiveImage((prev) =>
            prev === allImages.length - 1 ? 0 : prev + 1
        );
    };

    // Visa en laddningsindikator medan de första bilderna laddas
    if (!initialImagesLoaded) {
        return (
            <div className="loading-container" style={{ textAlign: 'center', padding: '20px' }}>
                <div className="loading-spinner"></div>
                <p>Laddar bilder...</p>
            </div>
        );
    }

    return (
        <div className="expandable-gallery-container">
            {/* Första sektionen med synliga bilder */}
            <div className="gallery-grid visible-gallery">
                {visibleImages.map((image, index) => (
                    <div
                        key={`visible-${index}`}
                        className="gallery-item"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="gallery-image"
                            loading="eager" // Ladda dessa bilder först
                        />
                        <div className="gallery-image-overlay"></div>
                    </div>
                ))}
            </div>

            {/* Visa knapp för att expandera endast om det finns fler bilder */}
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

            {/* Expanderad sektion med resterande bilder */}
            <div className={`expandable-section ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <>
                        <div className="gallery-grid expanded-gallery">
                            {expandedImages.map((image, index) => (
                                <div
                                    key={`expanded-${index}`}
                                    className="gallery-item"
                                    onClick={() => openLightbox(index, true)}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="gallery-image"
                                        loading="lazy" // Använd lazy loading för bilder i expanderad sektion
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

            {/* Lightbox för att visa bilder i full storlek */}
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

// CSS för laddningsindikatorn
const styles = `
.loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid hsl(160, 29%, 66%);
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Lägg till styling
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
}

export default ExpandableImageGallery;