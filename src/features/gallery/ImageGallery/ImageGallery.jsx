import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Masonry from "react-masonry-css";
import "./ImageGalleryStyles.css";
import CategoryToggle from "../CategoryToggle/CategoryToggle";
import galleryData from "../../../data/galleryCategories.json";

function StoregardensImageGallery() {
    const [activeCategory, setActiveCategory] = useState('alla');
    const [isLoading, setIsLoading] = useState(false);
    const [showAllImages, setShowAllImages] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [buttonMode, setButtonMode] = useState('hidden'); // hidden | fixed | bottom
    const buttonModeRef = useRef('hidden');
    const modelRef = useRef(null);
    const closeButtonRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);
    const preloadedSourcesRef = useRef(new Set());
    const setMode = useCallback((mode) => {
        if (buttonModeRef.current !== mode) {
            buttonModeRef.current = mode;
            setButtonMode(mode);
        }
    }, []);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

    // Get current category data
    const activeCategeryData = galleryData.categories.find(cat => cat.id === activeCategory);

    // Transform images for current category
    const images = useMemo(() => {
        if (!activeCategeryData || !activeCategeryData.images) {
            return [];
        }

        return activeCategeryData.images.map((imageData) => ({
            original: imageData.path,
            thumbnail: imageData.path,
            description: imageData.displayName,
            originalAlt: imageData.displayName,
            thumbnailAlt: imageData.displayName,
            filename: imageData.filename,
            subcategory: imageData.subcategory
        }));
    }, [activeCategeryData]);

    const toggleAllImages = useCallback(() => {
        setShowAllImages(!showAllImages);
    }, [showAllImages]);

    const openLightbox = useCallback((index) => {
        previouslyFocusedElementRef.current = document.activeElement;
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

    const goToImage = useCallback((index) => {
        if (!images.length) return;
        const normalized = ((index % images.length) + images.length) % images.length;
        setLightboxIndex(normalized);
    }, [images.length]);

    const goToNextImage = useCallback(() => {
        if (!images.length) return;
        setLightboxIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goToPreviousImage = useCallback(() => {
        if (!images.length) return;
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // ESC key to close lightbox & prevent body scroll
    useEffect(() => {
        if (showLightbox) {
            document.body.classList.add('lightbox-open');
        } else {
            document.body.classList.remove('lightbox-open');
        }
        return () => {
            document.body.classList.remove('lightbox-open');
        };
    }, [showLightbox]);

    useEffect(() => {
        if (!showLightbox) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showLightbox, closeLightbox]);

    useEffect(() => {
        if (!showLightbox || !images.length) return;

        const handleKeyNavigation = (event) => {
            switch (event.key) {
                case 'ArrowRight':
                    event.preventDefault();
                    goToNextImage();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    goToPreviousImage();
                    break;
                case 'Home':
                    event.preventDefault();
                    goToImage(0);
                    break;
                case 'End':
                    event.preventDefault();
                    goToImage(images.length - 1);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyNavigation);
        return () => {
            document.removeEventListener('keydown', handleKeyNavigation);
        };
    }, [showLightbox, images.length, goToNextImage, goToPreviousImage, goToImage]);

    useEffect(() => {
        if (!showLightbox) {
            const node = previouslyFocusedElementRef.current;
            if (node && typeof node.focus === 'function') {
                requestAnimationFrame(() => {
                    node.focus({ preventScroll: true });
                    previouslyFocusedElementRef.current = null;
                });
            }
            return;
        }

        const closeBtn = closeButtonRef.current;
        if (closeBtn) {
            closeBtn.focus({ preventScroll: true });
        }
    }, [showLightbox]);

    useEffect(() => {
        if (!showLightbox) return;
        const modelNode = modelRef.current;
        if (!modelNode) return;

        const focusableSelector = [
            'a[href]',
            'area[href]',
            'button:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        const handleKeyDown = (event) => {
            if (event.key !== 'Tab') return;

            const focusableElements = Array.from(modelNode.querySelectorAll(focusableSelector))
                .filter((el) => !el.hasAttribute('aria-hidden'));

            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const isShift = event.shiftKey;
            const active = document.activeElement;

            if (!isShift && active === lastElement) {
                event.preventDefault();
                firstElement.focus();
            } else if (isShift && active === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showLightbox]);

    const preloadImageAtIndex = useCallback((index) => {
        if (!images.length) return;
        const normalizedIndex = (index + images.length) % images.length;
        const item = images[normalizedIndex];
        if (!item?.original) return;
        if (preloadedSourcesRef.current.has(item.original)) return;

        const img = new Image();
        img.src = item.original;
        preloadedSourcesRef.current.add(item.original);
    }, [images]);

    useEffect(() => {
        preloadedSourcesRef.current.clear();
    }, [activeCategory]);

    useEffect(() => {
        if (!images.length) {
            setLightboxIndex(0);
            return;
        }

        setLightboxIndex((prev) => {
            if (prev >= images.length) {
                return images.length - 1;
            }
            if (prev < 0) {
                return 0;
            }
            return prev;
        });
    }, [images.length]);

    useEffect(() => {
        if (!showLightbox || !images.length) return;
        preloadImageAtIndex(lightboxIndex);
        preloadImageAtIndex(lightboxIndex + 1);
        preloadImageAtIndex(lightboxIndex - 1);
    }, [showLightbox, lightboxIndex, images, preloadImageAtIndex]);

    // Scroll-based button behavior
    useEffect(() => {
        if (!showAllImages) {
            setMode('hidden');
            return;
        }
        const el = containerRef.current;
        if (!el) return;

        let ticking = false;
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
                entries.forEach((entry) => {
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
        768: 2
    };

    const hasImages = images.length > 0;
    const currentImage = hasImages
        ? images[((lightboxIndex % images.length) + images.length) % images.length]
        : null;

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
                                <span className="image-category">{activeCategeryData?.name || 'Alla'}</span>
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
                                    <span className="image-category">{activeCategeryData?.name || 'Alla'}</span>
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

            {/* Lightbox model - only when clicking on individual images */}
            {showLightbox && (
                <div 
                    className="gallery-model"
                    role="dialog" 
                    aria-modal="true"
                    aria-labelledby="gallery-heading"
                    aria-describedby="gallery-description"
                    ref={modelRef}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeLightbox();
                        }
                    }}
                >
                    <div className="gallery-model-content">
                        <div id="gallery-description" className="sr-only">
                            Bildgalleri med {images.length} bilder. Använd pilknapparna för att navigera, ESC för att stänga.
                        </div>
                        <button
                            className="gallery-close-button"
                            onClick={closeLightbox}
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
                                            onClick={goToPreviousImage}
                                            aria-label="Visa föregående bild"
                                        >
                                            ‹
                                        </button>
                                    )}
                                    <figure className="lightbox-image-wrapper">
                                        <img
                                            src={currentImage.original}
                                            alt={currentImage.originalAlt || currentImage.description || 'Bild i galleriet'}
                                            loading="eager"
                                        />
                                        {currentImage.description && (
                                            <figcaption className="lightbox-caption">
                                                {currentImage.description}
                                            </figcaption>
                                        )}
                                    </figure>
                                    {images.length > 1 && (
                                        <button
                                            type="button"
                                            className="lightbox-nav lightbox-nav--next"
                                            onClick={goToNextImage}
                                            aria-label="Visa nästa bild"
                                        >
                                            ›
                                        </button>
                                    )}
                                </div>
                                <div className="lightbox-footer">
                                    <span className="lightbox-counter" aria-live="polite">
                                        {lightboxIndex + 1} / {images.length}
                                    </span>
                                    {images.length > 1 && (
                                        <div className="lightbox-thumbnails" role="list">
                                            {images.map((image, idx) => {
                                                const isActive = idx === lightboxIndex;
                                                return (
                                                    <button
                                                        key={image.filename ?? idx}
                                                        type="button"
                                                        className={`lightbox-thumbnail ${isActive ? 'is-active' : ''}`}
                                                        onClick={() => goToImage(idx)}
                                                        aria-label={`Gå till bild ${idx + 1} av ${images.length}`}
                                                        aria-current={isActive ? 'true' : undefined}
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
            )}
        </div>
    );
}

export default StoregardensImageGallery;
