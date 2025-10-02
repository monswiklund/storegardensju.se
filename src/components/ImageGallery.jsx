import { useState, useMemo, useCallback, useEffect } from "react";
import ImageGallery from "react-image-gallery";
import Masonry from "react-masonry-css";
import "react-image-gallery/styles/css/image-gallery.css";
import "./ImageGalleryStyles.css";
import CategoryToggle from "./CategoryToggle";
import galleryData from "../data/galleryCategories.json";

function StoregardensImageGallery() {
    const [activeCategory, setActiveCategory] = useState('alla');
    const [isLoading, setIsLoading] = useState(false);
    const [hideButton, setHideButton] = useState(false);
    
    // Helper function to get image path based on category and image number
    const getImagePath = (imageNumber, categoryId) => {
        if (categoryId === 'alla') {
            // För "alla", hitta i vilken kategori bilden finns
            for (const category of galleryData.categories) {
                if (category.id !== 'alla' && category.images.includes(imageNumber)) {
                    return `/images/${category.id}/slide${imageNumber}.jpg`;
                }
            }
            // Fallback till gamla strukturen om inte hittad
            return `/images/slides/slide${imageNumber}.jpg`;
        }
        return `/images/${categoryId}/slide${imageNumber}.jpg`;
    };

    // Memoize expensive image data generation
    const allImages = useMemo(() => {
        // Samla alla bildnummer från alla kategorier (exklusive "alla")
        const allImageNumbers = new Set();
        galleryData.categories.forEach(category => {
            if (category.id !== 'alla') {
                category.images.forEach(imgNum => allImageNumbers.add(imgNum));
            }
        });

        const sortedImageNumbers = Array.from(allImageNumbers).sort((a, b) => a - b);

        return sortedImageNumbers.map((imageNumber) => ({
            original: getImagePath(imageNumber, 'alla'),
            thumbnail: getImagePath(imageNumber, 'alla'),
            description: `Bild ${imageNumber} från Storegården 7`,
            originalAlt: `Bild ${imageNumber}`,
            thumbnailAlt: `Miniatyr ${imageNumber}`,
            imageNumber: imageNumber
        }));
    }, []);
    
    // Filter images based on active category
    const images = useMemo(() => {
        const activeCategeryData = galleryData.categories.find(cat => cat.id === activeCategory);
        if (!activeCategeryData || activeCategory === 'alla') {
            return allImages;
        }
        
        // För specifika kategorier, skapa bilder med rätt paths
        return activeCategeryData.images.map((imageNumber) => ({
            original: getImagePath(imageNumber, activeCategory),
            thumbnail: getImagePath(imageNumber, activeCategory),
            description: `Bild ${imageNumber} från Storegården 7`,
            originalAlt: `Bild ${imageNumber}`,
            thumbnailAlt: `Miniatyr ${imageNumber}`,
            imageNumber: imageNumber
        }));
    }, [activeCategory]);

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
    
    const handleCategoryChange = useCallback((categoryId) => {
        setIsLoading(true);
        setActiveCategory(categoryId);
        setShowAllImages(false); // Reset expand state when category changes
        setShowLightbox(false); // Close lightbox if open

        // Simulate loading time (bilder är redan cached, men ger visuell feedback)
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    }, []);

    const closeLightbox = useCallback(() => {
        setShowLightbox(false);
    }, []);

    const breakpointColumns = {
        default: 3,
        768: 2,
        480: 1
    };

    // Scroll listener to stick button when reaching end of gallery
    useEffect(() => {
        if (!showAllImages) {
            setHideButton(false);
            return;
        }

        const handleScroll = () => {
            const expandedContainer = document.querySelector('.expanded-gallery-container');
            if (!expandedContainer) return;

            const containerRect = expandedContainer.getBoundingClientRect();
            const containerBottom = containerRect.bottom;
            const viewportHeight = window.innerHeight;

            // If container bottom is above viewport bottom + small margin (10px), stick it
            const shouldStick = containerBottom < viewportHeight - 10;
            setHideButton(shouldStick);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [showAllImages]);

    return (
        <div className="storegarden-gallery">
            <h2 id="gallery-heading">Bildgalleri</h2>
            {/* Category Toggle */}
            <CategoryToggle
                categories={galleryData.categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />
            {/* Initial thumbnail grid - first 6 images */}
            {isLoading ? (
                <Masonry
                    breakpointCols={breakpointColumns}
                    className="gallery-grid"
                    columnClassName="gallery-column"
                >
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="gallery-thumbnail skeleton-item">
                            <div className="skeleton-image" style={{height: `${200 + (index % 3) * 50}px`}}></div>
                        </div>
                    ))}
                </Masonry>
            ) : (
                <Masonry
                    breakpointCols={breakpointColumns}
                    className="gallery-grid"
                    columnClassName="gallery-column"
                >
                    {images.slice(0, 6).map((image, index) => (
                        <div
                            key={index}
                            className="gallery-thumbnail"
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
                            <div className="image-overlay">
                                <span className="image-category">{galleryData.categories.find(cat => cat.id === activeCategory)?.name || 'Alla'}</span>
                                <span className="image-number">#{image.imageNumber}</span>
                            </div>
                        </div>
                    ))}
                </Masonry>
            )}

            {/* Show more button */}
            {!showAllImages && (
                <button
                    className="show-more-button"
                    onClick={toggleAllImages}
                    aria-expanded={showAllImages}
                    aria-controls="expanded-gallery"
                    aria-label={`Visa alla ${images.length} bilder i galleriet`}
                >
                    Visa alla bilder ({images.length})
                </button>
            )}

            {/* Expanded grid - remaining images */}
            {showAllImages && (
                <div className="expanded-gallery-container">
                    <Masonry
                        breakpointCols={breakpointColumns}
                        className="gallery-grid expanded-grid"
                        columnClassName="gallery-column"
                        id="expanded-gallery"
                    >
                        {images.slice(6).map((image, index) => (
                            <div
                                key={index + 6}
                                className="gallery-thumbnail"
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
                                <div className="image-overlay">
                                    <span className="image-category">{galleryData.categories.find(cat => cat.id === activeCategory)?.name || 'Alla'}</span>
                                    <span className="image-number">#{image.imageNumber}</span>
                                </div>
                            </div>
                        ))}
                    </Masonry>

                    {/* Sticky hide button */}
                    <button
                        className={`hide-images-button ${hideButton ? 'stuck' : ''}`}
                        onClick={toggleAllImages}
                        aria-label="Dölj utökade galleri bilder"
                    >
                        Dölj bilder
                    </button>
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