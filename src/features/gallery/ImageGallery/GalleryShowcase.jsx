import { useState, useMemo, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Camera } from "lucide-react";
import "./Gallery.css";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader.jsx";
import CategoryToggle from "../CategoryToggle/CategoryToggle";
import GalleryGrid from "./components/GalleryGrid";
import GalleryLightbox from "./components/GalleryLightbox";
import VenueIntroSection from "../../venue/VenueIntro/VenueIntroSection.jsx";
import useGalleryLightbox from "./hooks/useGalleryLightbox";
import { fetchGalleryCategories } from "../../../services/galleryService";
import { normalizeGalleryData } from "../normalizeGalleryData";

function GalleryShowcase({ eyebrow = "GALLERI", title = "Bildgalleri", lead }) {
  const [activeCategory, setActiveCategory] = useState("alla");
  const [galleryData, setGalleryData] = useState(null);

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

  // Fallback if the active category is not found (e.g. if "stellet" is not present)
  useEffect(() => {
    if (normalizedGallery.categories.length > 0) {
      const exists = normalizedGallery.categories.some(
        (cat) => cat.id === activeCategory
      );
      if (!exists) {
        setActiveCategory(normalizedGallery.categories[0].id);
      }
    }
  }, [activeCategory, normalizedGallery]);

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
      setActiveCategory(categoryId);
      closeLightbox();
    },
    [closeLightbox]
  );

  return (
    <div className="storegarden-gallery">

      {/* Venue Intro Section (Om platsen) */}
      <div className="gallery-venue-intro-wrapper" style={{ margin: "20px auto 40px", maxWidth: "800px", borderBottom: "1px solid #eae7e0", paddingBottom: "40px" }}>
        <VenueIntroSection />
      </div>

      <SectionHeader id="gallery-heading" eyebrow={eyebrow} title={title} lead={lead} icon={Camera} />

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
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
}

GalleryShowcase.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  lead: PropTypes.string,
};

export default GalleryShowcase;
