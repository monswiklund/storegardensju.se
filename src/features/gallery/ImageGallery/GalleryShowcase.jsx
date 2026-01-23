import { useState, useMemo, useCallback, useEffect } from "react";
import "./Gallery.css";
import CategoryToggle from "../CategoryToggle/CategoryToggle";
import staticGalleryData from "../../../data/galleryCategories.json";
import galleryOrder from "../../../data/gallery-order.json";
import GalleryGrid from "./components/GalleryGrid";
import ExpandedGallery from "./components/ExpandedGallery";
import GalleryLightbox from "./components/GalleryLightbox";
import FeaturedGallery from "../FeaturedGallery/FeaturedGallery";
import useGalleryLightbox from "./hooks/useGalleryLightbox";
import useDockedToggle from "./hooks/useDockedToggle";
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
  if (!hasAllCategory && categories.length > 0) {
    const allImages = categories.flatMap((category) =>
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

  return {
    categories,
    featured: data?.featured || raw?.featured || null,
  };
};

function GalleryShowcase() {
  const [activeCategory, setActiveCategory] = useState("alla");
  const [isLoading, setIsLoading] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
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

  // Featured images - lookup from "alla" category based on featured list
  const featuredImages = useMemo(() => {
    const featuredList =
      normalizedGallery.featured ||
      galleryOrder?.featured ||
      [];

    if (!featuredList || featuredList.length === 0) {
      return [];
    }

    const allaCategoryData = normalizedGallery.categories.find(
      (cat) => cat.id === "alla"
    );
    if (!allaCategoryData) {
      return [];
    }

    return featuredList
      .map((featuredId) => {
        const imageData = allaCategoryData.images.find(
          (img) =>
            img.filename === featuredId ||
            img.id === featuredId ||
            img.storageKey === featuredId
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
  }, [normalizedGallery]);

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
        categories={normalizedGallery.categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
}

export default GalleryShowcase;
