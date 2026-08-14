import { getCmsUrl } from "./cmsService";

let galleryCategoriesCache = null;
let galleryCategoriesRequest = null;

const CATEGORY_NAMES = {
  overvaning: "Loftet – Övervåning",
  undervaning: "Ladan – Bottenvåning",
  kok: "Kök & Arbetsytor",
  brollop: "Bröllop & Fest",
  kurser: "Kurser & Workshops",
  yoga: "Yoga på loftet",
  butik: "Gårdsbutik & Hantverk",
  ute: "Gården & Utemiljö",
  detaljer: "Detaljer & Dukning",
  ovrigt: "Övriga bilder",
};

const absoluteMediaUrl = (url, cmsUrl) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${cmsUrl}${url}`;
};

export function fetchGalleryCategories() {
  if (galleryCategoriesCache) {
    return Promise.resolve(galleryCategoriesCache);
  }

  if (!galleryCategoriesRequest) {
    const cmsUrl = getCmsUrl();
    const query = new URLSearchParams({
      limit: "100",
      sort: "order",
    });

    galleryCategoriesRequest = fetch(`${cmsUrl}/api/media?${query}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.docs) && data.docs.length > 0) {
          const categoryMap = new Map();

          data.docs.forEach((doc) => {
            const catId = doc.category || "overvaning";
            if (!categoryMap.has(catId)) {
              categoryMap.set(catId, {
                id: catId,
                name: CATEGORY_NAMES[catId] || catId,
                description: `Bilder i kategorin ${CATEGORY_NAMES[catId] || catId}`,
                images: [],
              });
            }

            const catGroup = categoryMap.get(catId);
            const imagePath =
              absoluteMediaUrl(doc.externalUrl, cmsUrl) ||
              absoluteMediaUrl(doc.url, cmsUrl) ||
              `/images/gallery/${doc.filename}`;
            const thumbnailPath =
              absoluteMediaUrl(
                doc.sizes?.thumbnail?.url || doc.thumbnailURL,
                cmsUrl
              ) || imagePath;

            catGroup.images.push({
              id: String(doc.id),
              filename: doc.filename,
              displayName: doc.displayName || doc.alt || doc.filename,
              alt: doc.alt || doc.displayName,
              category: catId,
              path: imagePath,
              thumbnailPath,
              order: Number(doc.order) || 10,
              allOrder: Number(doc.allOrder) || 10,
            });
          });

          categoryMap.set("alla", {
            id: "alla",
            name: "Alla bilder",
            description: "Alla bilder från Storegården 7",
            order: -1,
            images: data.docs
              .map((doc) => {
                const imagePath =
                  absoluteMediaUrl(doc.externalUrl, cmsUrl) ||
                  absoluteMediaUrl(doc.url, cmsUrl) ||
                  `/images/gallery/${doc.filename}`;
                return {
                  id: String(doc.id),
                  filename: doc.filename,
                  displayName: doc.displayName || doc.alt || doc.filename,
                  alt: doc.alt || doc.displayName,
                  category: doc.category || "ovrigt",
                  path: imagePath,
                  thumbnailPath:
                    absoluteMediaUrl(doc.sizes?.thumbnail?.url || doc.thumbnailURL, cmsUrl) ||
                    imagePath,
                  order: Number(doc.allOrder) || 10,
                };
              })
              .sort((a, b) => a.order - b.order),
          });

          const categories = Array.from(categoryMap.values());
          const structuredData = { categories };
          galleryCategoriesCache = structuredData;
          return structuredData;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        galleryCategoriesRequest = null;
      });
  }

  return galleryCategoriesRequest;
}

export function clearGalleryCategoriesCache() {
  galleryCategoriesCache = null;
  galleryCategoriesRequest = null;
}
