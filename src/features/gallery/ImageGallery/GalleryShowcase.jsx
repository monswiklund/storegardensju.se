import { useState, useMemo, useCallback } from "react";
import "./Gallery.css";
import CategoryToggle from "../CategoryToggle/CategoryToggle";
import galleryData from "../../../data/galleryCategories.json";
import GalleryGrid from "./components/GalleryGrid";
import ExpandedGallery from "./components/ExpandedGallery";
import GalleryLightbox from "./components/GalleryLightbox";
import useGalleryLightbox from "./hooks/useGalleryLightbox";
import useDockedToggle from "./hooks/useDockedToggle";

function GalleryShowcase() {
  const [activeCategory, setActiveCategory] = useState("alla");
  const [isLoading, setIsLoading] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  const activeCategoryData = useMemo(
    () => galleryData.categories.find((cat) => cat.id === activeCategory),
    [activeCategory],
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

  const { mode: buttonMode, containerRef, buttonRef } = useDockedToggle(showAllImages);

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
    [closeLightbox],
  );

  const categoryName = activeCategoryData?.name || "Alla";

  return (
    <div className="storegarden-gallery">
      <h2 id="gallery-heading">Bildgalleri</h2>
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
      />
    </div>
  );
}

export default GalleryShowcase;
