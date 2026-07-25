import staticGalleryData from "../../data/galleryCategories.json";

const normalizeImage = (image) => ({
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
});

const imageIdentity = (image, categoryId, index) =>
  image.id ||
  image.storageKey ||
  image.path ||
  image.url ||
  image.publicUrl ||
  image.filename ||
  `${categoryId}:${index}`;

const imageOrder = (image, fallback) =>
  Number.isFinite(Number(image?.order)) ? Number(image.order) : fallback;

/** Sorts on the category-scoped `order` the API returns, ties on upload time. */
const sortByOrder = (images) =>
  images
    .map((image, index) => ({ image, index }))
    .sort((a, b) => {
      const orderA = imageOrder(a.image, a.index);
      const orderB = imageOrder(b.image, b.index);
      if (orderA === orderB) {
        const createdA = Number(a.image.createdAt) || 0;
        const createdB = Number(b.image.createdAt) || 0;
        if (createdA === createdB) return a.index - b.index;
        return createdA - createdB;
      }
      return orderA - orderB;
    })
    .map((entry) => entry.image);

const deduplicateCategoryImages = (category) => {
  const uniqueImages = new Map();
  (category.images || []).forEach((image, index) => {
    const normalizedImage = normalizeImage(image);
    const identity = imageIdentity(normalizedImage, category.id, index);
    if (!uniqueImages.has(identity)) {
      uniqueImages.set(identity, normalizedImage);
    }
  });
  return sortByOrder(Array.from(uniqueImages.values()));
};

export const isAllGalleryCategory = (category) => {
  const id = String(category?.id || "").trim().toLowerCase();
  const slug = String(category?.slug || "").trim().toLowerCase();
  const name = String(category?.name || "").trim().toLowerCase();
  return (
    id === "alla" ||
    id === "all" ||
    slug === "alla-bilder" ||
    slug === "all-images" ||
    name === "alla bilder" ||
    name === "all images"
  );
};

export const normalizeGalleryData = (data) => {
  const raw = data?.categories ? data : staticGalleryData;
  const normalizedCategories = (raw?.categories || []).map((category) => ({
    ...category,
    images: deduplicateCategoryImages(category),
  }));
  const storedAllCategory = normalizedCategories.find(isAllGalleryCategory);
  const specificCategories = normalizedCategories.filter(
    (category) => !isAllGalleryCategory(category)
  );

  specificCategories.sort((a, b) => {
    const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
    const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
    if (orderA === orderB) {
      return (a.name || "").localeCompare(b.name || "", "sv");
    }
    return orderA - orderB;
  });

  const uniqueImages = new Map();
  specificCategories.forEach((category) => {
    (category.images || []).forEach((image, index) => {
      const identity = imageIdentity(image, category.id, index);
      if (!uniqueImages.has(identity)) {
        uniqueImages.set(identity, {
          ...image,
          categoryId: image.categoryId || category.id,
        });
      }
    });
  });

  // "Alla bilder" is a real membership category: an image that belongs to it has
  // its own sort_order there, curated independently of the specific categories.
  // Images not yet a member (mid-migration, or just uploaded) keep their
  // category-derived position and land after the curated ones, so the view
  // degrades gracefully instead of dropping them.
  const curatedAllOrder = new Map();
  const curatedAllImages = new Map();
  (storedAllCategory?.images || []).forEach((image, index) => {
    const identity = imageIdentity(image, storedAllCategory.id || "alla", index);
    curatedAllOrder.set(identity, imageOrder(image, index));
    curatedAllImages.set(identity, image);
  });

  const allImages = Array.from(uniqueImages.entries())
    // A curated member is taken from the stored category, not from the union:
    // its `order` is the position in Alla bilder, while the union copy carries
    // the order of whichever specific category it came from.
    .map(([identity, image], index) => ({
      identity,
      image: curatedAllImages.get(identity) || image,
      index,
    }))
    .sort((a, b) => {
      const curatedA = curatedAllOrder.get(a.identity);
      const curatedB = curatedAllOrder.get(b.identity);
      const hasA = curatedA !== undefined;
      const hasB = curatedB !== undefined;
      if (hasA && hasB) {
        if (curatedA === curatedB) return a.index - b.index;
        return curatedA - curatedB;
      }
      if (hasA !== hasB) return hasA ? -1 : 1;
      return a.index - b.index;
    })
    .map((entry) => entry.image);

  const categories =
    specificCategories.length === 0
      ? normalizedCategories
      : [
          {
            ...storedAllCategory,
            id: storedAllCategory?.id || "alla",
            name: storedAllCategory?.name || "Alla bilder",
            description:
              storedAllCategory?.description ||
              "Alla bilder från Storegården 7",
            order: -1,
            images: allImages,
          },
          ...specificCategories,
        ];

  return {
    categories,
    featured: data?.featured || raw?.featured || null,
  };
};
