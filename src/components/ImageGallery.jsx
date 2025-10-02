import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import ImageGallery from "react-image-gallery";
import Masonry from "react-masonry-css";
import "react-image-gallery/styles/css/image-gallery.css";
import "./ImageGalleryStyles.css";
import CategoryToggle from "./CategoryToggle";
import galleryData from "../data/galleryCategories.json";

function StoregardensImageGallery() {
    const [activeCategory, setActiveCategory] = useState('alla');
    const [isLoading, setIsLoading] = useState(false);
    const [showAllImages, setShowAllImages] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [buttonMode, setButtonMode] = useState('hidden'); // hidden | fixed | bottom
    const buttonModeRef = useRef('hidden');
    const setMode = useCallback((mode) => {
        if (buttonModeRef.current !== mode) {
            buttonModeRef.current = mode;
            setButtonMode(mode);
        }
    }, []);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

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
    }, [activeCategory, allImages]);

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

    // Scroll-based button behavior
    useEffect(() => {
        if (!showAllImages) {
            setMode('hidden');
            return;
        }
        const el = containerRef.current;
        if (!el) return;

        let ticking = false;
        const FIXED_OFFSET = 30; // distance from viewport bottom while fixed
        const DOCK_THRESHOLD = 8; // how close (px) viewport bottom must be to container bottom to dock

        const getAbsoluteTop = (node) => {
            let top = 0;
            let current = node;
            while (current) {
                top += current.offsetTop || 0;
                current = current.offsetParent;
            }
            return top;
        };

        let topIn = false;
        let bottomIn = false;
        const topSentinel = el.querySelector('.sentinel-top');
        const bottomSentinel = el.querySelector('.sentinel-bottom');
        let io;
        if ('IntersectionObserver' in window && topSentinel && bottomSentinel) {
            io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.target === topSentinel) topIn = entry.isIntersecting;
                    if (entry.target === bottomSentinel) bottomIn = entry.isIntersecting;
                });
                if (!topIn && !bottomIn) {
                    const containerTopAbs = getAbsoluteTop(el);
                    const containerBottomAbs = containerTopAbs + el.offsetHeight;
                    const scrollY = window.scrollY || window.pageYOffset;
                    const viewportBottom = scrollY + (window.innerHeight || document.documentElement.clientHeight);
                    if (viewportBottom < containerTopAbs || scrollY >= containerBottomAbs) {
                        setMode('hidden');
                        return;
                    }
                }
                if (bottomIn) {
                    setMode('bottom');
                } else if (topIn) {
                    setMode('fixed');
                }
            }, { root: null, threshold: 0 });
            io.observe(topSentinel);
            io.observe(bottomSentinel);
        }

        const computeAndSet = () => {
            if (!containerRef.current) return;
            const container = containerRef.current;
            const containerTop = getAbsoluteTop(container);
            const containerHeight = container.offsetHeight;
            const containerBottom = containerTop + containerHeight;

            const scrollY = window.scrollY || window.pageYOffset;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const viewportBottom = scrollY + viewportHeight;

            if (viewportBottom < containerTop) {
                setMode('hidden');
                return;
            }
            if (scrollY >= containerBottom) {
                setMode('hidden');
                return;
            }
            // Later docking: only dock when really near bottom
            if (viewportBottom >= containerBottom - DOCK_THRESHOLD) {
                setMode('bottom');
                return;
            }
            setMode('fixed');
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    computeAndSet();
                    ticking = false;
                });
            }
        };
        const onResize = () => computeAndSet();

        let resizeObserver;
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(() => computeAndSet());
            resizeObserver.observe(el);
        }
        const imgs = el.querySelectorAll('img');
        imgs.forEach(img => {
            if (!img.complete) {
                img.addEventListener('load', computeAndSet, { once: true });
            }
        });

        setTimeout(computeAndSet, 50);
        setTimeout(computeAndSet, 200);
        setTimeout(computeAndSet, 600);

        computeAndSet();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            if (resizeObserver) resizeObserver.disconnect();
            if (io) io.disconnect();
        };
    }, [showAllImages, setMode]);

    const breakpointColumns = {
        default: 3,
        768: 2,
        480: 1
    };

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
                <div className="expanded-gallery-container" ref={containerRef}>
                    <div className="gallery-sentinel sentinel-top" aria-hidden="true" />
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
                    <div className="gallery-sentinel sentinel-bottom" aria-hidden="true" />
                    {/* Sticky hide button */}
                    <button
                        ref={buttonRef}
                        className={`hide-images-button ${buttonMode === 'fixed' ? 'is-fixed' : ''} ${buttonMode === 'bottom' ? 'at-bottom' : ''} ${buttonMode === 'hidden' ? 'is-hidden' : ''}`}
                        onClick={toggleAllImages}
                        aria-label="Dölj utökade galleri bilder"
                        aria-hidden={buttonMode === 'hidden'}
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
