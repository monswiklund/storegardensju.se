import { getCmsUrl } from "./cmsService";
import { getPageCopySync } from "../hooks/usePageCopy";

let galleryCategoriesCache = null;
let galleryCategoriesRequest = null;

const getCategoryName = (catId) => {
  const siteCopy = getPageCopySync("site");
  const copyId = catId === "alla" ? "all" : catId;
  return siteCopy ? siteCopy(`gallery.cat.${copyId}`) : catId;
};

const absoluteMediaUrl = (url, cmsUrl) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${cmsUrl}${url}`;
};

const mediaOrder = (doc, field) => {
  const value = Number(doc?.[field]);
  return Number.isFinite(value) ? value : 10;
};

const compareMedia = (field) => (a, b) =>
  mediaOrder(a, field) - mediaOrder(b, field) || Number(a.id) - Number(b.id);

export function fetchGalleryCategories() {
  if (galleryCategoriesCache) {
    return Promise.resolve(galleryCategoriesCache);
  }

  if (!galleryCategoriesRequest) {
    const cmsUrl = getCmsUrl();
    const query = new URLSearchParams({
      limit: "100",
      sort: "order",
      "where[showInGallery][equals]": "true",
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

          [...data.docs].sort(compareMedia("order")).forEach((doc) => {
            const catId = doc.category || "overvaning";
            if (!categoryMap.has(catId)) {
              categoryMap.set(catId, {
                id: catId,
                name: getCategoryName(catId),
                description: "",
                images: [],
              });
            }

            const catGroup = categoryMap.get(catId);
            const imagePath =
              absoluteMediaUrl(doc.externalUrl, cmsUrl) ||
              absoluteMediaUrl(doc.url, cmsUrl);
            const thumbnailPath =
              absoluteMediaUrl(
                doc.sizes?.thumbnail?.url || doc.thumbnailURL,
                cmsUrl
              ) || imagePath;

            catGroup.images.push({
              id: String(doc.legacyId || doc.id),
              filename: doc.filename || doc.legacyId,
              displayName: doc.displayName || doc.alt || doc.filename,
              alt: doc.alt || doc.displayName,
              category: catId,
              path: imagePath,
              thumbnailPath,
              width: doc.width,
              height: doc.height,
              order: mediaOrder(doc, "order"),
              allOrder: mediaOrder(doc, "allOrder"),
            });
          });

          categoryMap.set("alla", {
            id: "alla",
            name: getCategoryName("alla"),
            description: "",
            order: -1,
            images: [...data.docs]
              .sort(compareMedia("allOrder"))
              .map((doc) => {
                const imagePath =
                  absoluteMediaUrl(doc.externalUrl, cmsUrl) ||
                  absoluteMediaUrl(doc.url, cmsUrl);
                return {
                  id: String(doc.legacyId || doc.id),
                  filename: doc.filename || doc.legacyId,
                  displayName: doc.displayName || doc.alt || doc.filename,
                  alt: doc.alt || doc.displayName,
                  category: doc.category || "ovrigt",
                  path: imagePath,
                  thumbnailPath:
                    absoluteMediaUrl(doc.sizes?.thumbnail?.url || doc.thumbnailURL, cmsUrl) ||
                    imagePath,
                  width: doc.width,
                  height: doc.height,
                  order: mediaOrder(doc, "allOrder"),
                };
              }),
          });

          const categories = Array.from(categoryMap.values());
          const featured = [...data.docs]
            .filter((doc) => doc.featured)
            .sort(compareMedia("allOrder"))
            .map((doc) => String(doc.legacyId || doc.id));
          const structuredData = { categories, featured };
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
