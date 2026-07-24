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
    images: (category.images || []).map(normalizeImage),
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
            images: Array.from(uniqueImages.values()),
          },
          ...specificCategories,
        ];

  return {
    categories,
    featured: data?.featured || raw?.featured || null,
  };
};

