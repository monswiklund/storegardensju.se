import { useState, useMemo, useCallback } from "react";
import "./Gallery.css";
import CategoryToggle from "../CategoryToggle/CategoryToggle";
import galleryData from "../../../data/galleryCategories.json";
import galleryOrder from "../../../data/gallery-order.json";
import GalleryGrid from "./components/GalleryGrid";
import ExpandedGallery from "./components/ExpandedGallery";
import GalleryLightbox from "./components/GalleryLightbox";
import FeaturedGallery from "../FeaturedGallery/FeaturedGallery";
import useGalleryLightbox from "./hooks/useGalleryLightbox";
import useDockedToggle from "./hooks/useDockedToggle";
import logoImage from "../../../assets/logoTransp_cropped.png";

function GalleryShowcase() {
  const [activeCategory, setActiveCategory] = useState("alla");
  const [isLoading, setIsLoading] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  const activeCategoryData = useMemo(
    () => galleryData.categories.find((cat) => cat.id === activeCategory),
    [activeCategory]
  );

  const images = useMemo(() => {
    if (!activeCategoryData?.images) {
      return [];
    }

    return activeCategoryData.images.map((imageData) => ({
      original: imageData.path,
      thumbnail: imageData.path,
      description: imageData.displayName,
      originalAlt: imageData.displayName,
      thumbnailAlt: imageData.displayName,
      filename: imageData.filename,
      subcategory: imageData.subcategory,
    }));
  }, [activeCategoryData]);

  // Featured images - lookup from "alla" category based on featured list
  const featuredImages = useMemo(() => {
    if (!galleryOrder?.featured || galleryOrder.featured.length === 0) {
      return [];
    }

    const allaCategoryData = galleryData.categories.find(
      (cat) => cat.id === "alla"
    );
    if (!allaCategoryData) {
      return [];
    }

    return galleryOrder.featured
      .map((filename) => {
        const imageData = allaCategoryData.images.find(
          (img) => img.filename === filename
        );
        if (!imageData) return null;

        return {
          original: imageData.path,
          thumbnail: imageData.path,
          description: imageData.displayName,
          originalAlt: imageData.displayName,
          thumbnailAlt: imageData.displayName,
          filename: imageData.filename,
          subcategory: imageData.subcategory,
        };
      })
      .filter(Boolean);
  }, []);

  // Separate lightbox for featured gallery
  const {
    isOpen: showFeaturedLightbox,
    currentIndex: featuredLightboxIndex,
    currentImage: featuredCurrentImage,
    openLightbox: openFeaturedLightbox,
    closeLightbox: closeFeaturedLightbox,
    goToImage: goToFeaturedImage,
    goToNextImage: goToFeaturedNextImage,
    goToPreviousImage: goToFeaturedPreviousImage,
    dialogRef: featuredDialogRef,
    closeButtonRef: featuredCloseButtonRef,
  } = useGalleryLightbox(featuredImages, "featured");

  // Main gallery lightbox
  const {
    isOpen: showLightbox,
    currentIndex: lightboxIndex,
    currentImage,
    openLightbox,
    closeLightbox,
    goToImage,
    goToNextImage,
    goToPreviousImage,
    dialogRef,
    closeButtonRef,
  } = useGalleryLightbox(images, activeCategory);

  const {
    mode: buttonMode,
    containerRef,
    buttonRef,
  } = useDockedToggle(showAllImages);

  const toggleAllImages = useCallback(() => {
    setShowAllImages((prev) => !prev);
  }, []);

  const handleCategoryChange = useCallback(
    (categoryId) => {
      setIsLoading(true);
      setActiveCategory(categoryId);
      setShowAllImages(false);
      closeLightbox();

      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    },
    [closeLightbox]
  );

  const categoryName = activeCategoryData?.name || "Alla";

  return (
    <div className="storegarden-gallery">
      <div className="gallery-logo-container">
        <img src={logoImage} alt="Storegården 7" className="gallery-logo" />
      </div>

      <h2 id="gallery-heading">Bildgalleri</h2>

      {/* Featured Gallery - always visible */}
      {featuredImages.length > 0 && (
        <FeaturedGallery
          images={featuredImages}
          onImageSelect={openFeaturedLightbox}
        />
      )}

      <CategoryToggle
        categories={galleryData.categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <GalleryGrid
        images={images}
        isLoading={isLoading}
        onImageSelect={openLightbox}
        categoryName={categoryName}
      />

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

      {showAllImages && (
        <ExpandedGallery
          images={images.slice(6)}
          startIndex={6}
          totalCount={images.length}
          onImageSelect={openLightbox}
          categoryName={categoryName}
          buttonMode={buttonMode}
          onToggle={toggleAllImages}
          containerRef={containerRef}
          buttonRef={buttonRef}
        />
      )}

      {/* Featured Gallery Lightbox */}
      <GalleryLightbox
        isOpen={showFeaturedLightbox}
        images={featuredImages}
        currentIndex={featuredLightboxIndex}
        currentImage={featuredCurrentImage}
        onClose={closeFeaturedLightbox}
        onNext={goToFeaturedNextImage}
        onPrevious={goToFeaturedPreviousImage}
        onSelectImage={goToFeaturedImage}
        dialogRef={featuredDialogRef}
        closeButtonRef={featuredCloseButtonRef}
      />

      {/* Main Gallery Lightbox */}
      <GalleryLightbox
        isOpen={showLightbox}
        images={images}
        currentIndex={lightboxIndex}
        currentImage={currentImage}
        onClose={closeLightbox}
        onNext={goToNextImage}
        onPrevious={goToPreviousImage}
        onSelectImage={goToImage}
        dialogRef={dialogRef}
        closeButtonRef={closeButtonRef}
        categories={galleryData.categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
}

export default GalleryShowcase;
