import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import "./Gallery.css";
import CategoryToggle from "../CategoryToggle/CategoryToggle";
import GalleryGrid from "./components/GalleryGrid";
import GalleryLightbox from "./components/GalleryLightbox";
import useGalleryLightbox from "./hooks/useGalleryLightbox";
import { fetchGalleryCategories } from "../../../services/galleryService";
import { normalizeGalleryData } from "../normalizeGalleryData";
import { smoothScrollTo } from "../../../utils/scrollUtils";

// Where the category picker sticks: under the 60px navbar, see .category-toggle in CategoryToggle.css.
const STUCK_TOGGLE_TOP = 68;

// The page's own heading introduces the photos, so the wall starts right under it.
function GalleryShowcase() {
  // The visitor's choice; until then the gallery opens on "Utvalda".
  const [chosenCategory, setChosenCategory] = useState(null);
  const [galleryData, setGalleryData] = useState(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetchGalleryCategories()
      .then((data) => {
        if (isMounted) {
          setGalleryData(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setGalleryData(null);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedGallery = useMemo(
    () => normalizeGalleryData(galleryData),
    [galleryData]
  );

  // Derived rather than stored: the CMS answer may add "Utvalda" after a first render without it.
  const activeCategory = useMemo(() => {
    const ids = normalizedGallery.categories.map((cat) => cat.id);
    return [chosenCategory, "utvalda", "alla"].find((id) => ids.includes(id)) || ids[0] || "alla";
  }, [chosenCategory, normalizedGallery]);

  const activeCategoryData = useMemo(
    () =>
      normalizedGallery.categories.find((cat) => cat.id === activeCategory),
    [activeCategory, normalizedGallery]
  );

  const images = useMemo(() => {
    if (!activeCategoryData?.images) {
      return [];
    }

    return activeCategoryData.images.map((imageData) => ({
      original: imageData.path,
      galleryPath: imageData.path,
      thumbnail: imageData.thumbnailPath || imageData.path,
      width: imageData.width,
      height: imageData.height,
      description: imageData.displayName,
      originalAlt: imageData.displayName,
      thumbnailAlt: imageData.displayName,
      filename: imageData.filename,
      subcategory: imageData.subcategory,
    }));
  }, [activeCategoryData]);

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

  const handleCategoryChange = useCallback(
    (categoryId) => {
      setChosenCategory(categoryId);
      closeLightbox();
      // Picked from the stuck picker further down: start the new category from its first photo.
      const gallery = galleryRef.current;
      if (gallery && gallery.getBoundingClientRect().top < STUCK_TOGGLE_TOP) {
        smoothScrollTo(gallery, STUCK_TOGGLE_TOP);
      }
    },
    [closeLightbox]
  );

  return (
    <div className="storegarden-gallery" id="gallery-images" ref={galleryRef}>
      <CategoryToggle
        categories={normalizedGallery.categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <GalleryGrid
        key={`${activeCategory}:${images.length}`}
        images={images}
        onImageSelect={openLightbox}
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
        categories={normalizedGallery.categories}
        activeCategory={activeCategory}
        onCategoryChange={setChosenCategory}
      />
    </div>
  );
}

export default GalleryShowcase;
