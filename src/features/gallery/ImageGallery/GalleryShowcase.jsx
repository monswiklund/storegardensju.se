import { useState, useMemo, useCallback, useEffect } from "react";
import "./Gallery.css";
import CategoryToggle from "../CategoryToggle/CategoryToggle";
import staticGalleryData from "../../../data/galleryCategories.json";
import galleryOrder from "../../../data/gallery-order.json";
import GalleryGrid from "./components/GalleryGrid";
import GalleryLightbox from "./components/GalleryLightbox";
import VenueIntroSection from "../../venue/VenueIntro/VenueIntroSection.jsx";
import useGalleryLightbox from "./hooks/useGalleryLightbox";
import logoImage from "../../../assets/logoTransp_cropped.png";
import { fetchGalleryCategories } from "../../../services/galleryService";

const normalizeGalleryData = (data) => {
  const raw = data?.categories ? data : staticGalleryData;
  let categories = (raw?.categories || []).map((category) => ({
    ...category,
    images: (category.images || []).map((image) => ({
      ...image,
      path:
        image.path ||
        image.url ||
        image.publicUrl ||
        image.storageUrl ||
        image.src ||
        "",
      displayName:
        image.displayName ||
        image.title ||
        image.alt ||
        image.filename ||
        image.id ||
        "Bild",
    })),
  }));

  categories.sort((a, b) => {
    const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
    const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
    if (orderA === orderB) {
      return (a.name || "").localeCompare(b.name || "", "sv");
    }
    return orderA - orderB;
  });

  const hasAllCategory = categories.some((category) => category.id === "alla");
  let allImages = [];
  if (categories.length > 0) {
    if (hasAllCategory) {
      allImages = categories.find((c) => c.id === "alla").images;
    } else {
      allImages = categories.flatMap((category) =>
        (category.images || []).map((image) => ({
          ...image,
          categoryId: category.id,
        }))
      );
      categories = [
        {
          id: "alla",
          name: "Alla bilder",
          description: "Alla bilder från Storegården 7",
          images: allImages,
          order: -1,
        },
        ...categories,
      ];
    }
  }

  return {
    categories,
    featured: data?.featured || raw?.featured || null,
  };
};

function GalleryShowcase() {
  const [activeCategory, setActiveCategory] = useState("alla");
  const [isLoading, setIsLoading] = useState(false);
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
      thumbnail: imageData.path,
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
      setIsLoading(true);
      setActiveCategory(categoryId);
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

      {/* Venue Intro Section (Om platsen) */}
      <div className="gallery-venue-intro-wrapper" style={{ margin: "20px auto 40px", maxWidth: "800px", borderBottom: "1px solid #eae7e0", paddingBottom: "40px" }}>
        <VenueIntroSection />
      </div>

      <h2 id="gallery-heading">Bildgalleri</h2>

      <CategoryToggle
        categories={normalizedGallery.categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <GalleryGrid
        images={images}
        isLoading={isLoading}
        onImageSelect={openLightbox}
        categoryName={categoryName}
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

export default GalleryShowcase;
