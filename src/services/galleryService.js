import { getCmsUrl } from "./cmsService";
import { getPageCopySync } from "../hooks/usePageCopy";

let galleryCategoriesCache = null;
let galleryCategoriesRequest = null;

// Until the CMS has the copy row, the selection still needs a name on its tab.
const CATEGORY_FALLBACKS = { utvalda: "Utvalda" };

const getCategoryName = (catId) => {
  const siteCopy = getPageCopySync("site");
  const copyId = catId === "alla" ? "all" : catId;
  return siteCopy ? siteCopy(`gallery.cat.${copyId}`, CATEGORY_FALLBACKS[catId]) : catId;
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

const PAGE_SIZE = 100;
// Far above the real library; only stops a CMS that keeps answering hasNextPage forever.
const MAX_PAGES = 50;

/** Reads every gallery page; a short or inconsistent answer fails instead of showing a cut-off gallery. */
async function fetchAllGalleryMedia(cmsUrl) {
  const byId = new Map();
  let totalDocs = null;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const query = new URLSearchParams({
      depth: "0",
      limit: String(PAGE_SIZE),
      page: String(page),
      // A unique sort key keeps pages from overlapping; display order is applied below.
      sort: "id",
      "where[showInGallery][equals]": "true",
    });
    const res = await fetch(`${cmsUrl}/api/media?${query}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data?.docs)) throw new Error("Invalid media response");
    data.docs.forEach((doc) => byId.set(String(doc.id), doc));
    if (Number.isFinite(data.totalDocs)) totalDocs = data.totalDocs;
    if (!data.hasNextPage) {
      if (totalDocs !== null && byId.size !== totalDocs) {
        throw new Error(`Gallery incomplete: ${byId.size} of ${totalDocs}`);
      }
      return { docs: [...byId.values()] };
    }
  }
  throw new Error(`Gallery has more than ${MAX_PAGES} pages`);
}

export function fetchGalleryCategories() {
  if (galleryCategoriesCache) {
    return Promise.resolve(galleryCategoriesCache);
  }

  if (!galleryCategoriesRequest) {
    const cmsUrl = getCmsUrl();
    galleryCategoriesRequest = fetchAllGalleryMedia(cmsUrl)
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

          const allOrderImage = (doc) => {
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
          };

          categoryMap.set("alla", {
            id: "alla",
            name: getCategoryName("alla"),
            description: "",
            order: -1,
            images: [...data.docs].sort(compareMedia("allOrder")).map(allOrderImage),
          });

          // The selection the gallery opens on; it keeps the "Alla bilder" order.
          const picks = data.docs.filter((doc) => doc.galleryFeatured);
          if (picks.length > 0) {
            categoryMap.set("utvalda", {
              id: "utvalda",
              name: getCategoryName("utvalda"),
              description: "",
              order: -2,
              images: [...picks].sort(compareMedia("allOrder")).map(allOrderImage),
            });
          }

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
