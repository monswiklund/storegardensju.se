import initialCmsData from "../data/initialCmsData.json";
import CMS_CONTENT from "../data/cmsContent.generated.js";
import { normalizePageAppearance, projectPage } from "../data/cmsProjection.js";

export function getCmsUrl() {
  const configured = import.meta.env.VITE_CMS_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3002";
  }
  return "https://cms.storegardensju.se";
}

const pageRequests = new Map();
let shopProductsRequest = null;

export { normalizePageAppearance };

const missingPage = (source) => Object.freeze({
  found: false, source, copy: {}, lists: {}, images: {}, socialImage: null, appearance: normalizePageAppearance(),
});

const frozenPage = (page, source) => Object.freeze({
  found: true,
  source,
  copy: Object.freeze({ ...(page.copy || {}) }),
  lists: Object.freeze(Object.fromEntries(Object.entries(page.lists || {}).map(([key, items]) => [key, Object.freeze(items)]))),
  images: Object.freeze({ ...(page.images || {}) }),
  socialImage: page.socialImage || null,
  appearance: page.appearance || normalizePageAppearance(),
});

/** One published page from a Payload list answer, in the projected shape (cmsProjection.projectPage). */
export function normalizePageContent(payload, cmsUrl = getCmsUrl()) {
  const doc = payload?.docs?.[0];
  return doc ? frozenPage(projectPage(doc, cmsUrl), "cms") : missingPage("cms");
}

export function normalizePageCopy(payload) {
  return normalizePageContent(payload).copy;
}

const pageContentCache = new Map();
const compiledPageContent = new Map();

// What a page shows before (or without) a live answer: the CMS export baked into this build, or
// the checked-in fixture where nothing was exported (local development and tests).
function initPageContentCache() {
  const pages = CMS_CONTENT?.pages || initialCmsData || {};
  const source = CMS_CONTENT?.pages ? "snapshot" : "fixture";
  for (const [slug, page] of Object.entries(pages)) {
    const content = frozenPage(page, source);
    compiledPageContent.set(slug, content);
    pageContentCache.set(slug, content);
  }
}

initPageContentCache();

export function getPageContentSync(slug) {
  return pageContentCache.get(slug) || null;
}

export function getPageCopySync(slug) {
  const cached = pageContentCache.get(slug);
  if (cached?.copy) {
    return (key, fallback = "") =>
      Object.prototype.hasOwnProperty.call(cached.copy, key) ? cached.copy[key] : fallback;
  }
  return (_key, fallback = "") => fallback;
}

/**
 * One published page. A live document replaces the build's version whole, so a row the editor
 * removed is not filled in from the snapshot. A failed request, or a page the CMS does not
 * publish (every rendered page is required by the export), keeps what the build shipped.
 */
export function fetchPageContent(slug) {
  if (!pageRequests.has(slug)) {
    const cmsUrl = getCmsUrl();
    const query = new URLSearchParams({
      "where[slug][equals]": slug,
      limit: "1",
      depth: "1",
    });

    const request = fetch(`${cmsUrl}/api/pages?${query}`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`CMS request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        if (!Array.isArray(json?.docs)) throw new Error("CMS answer without docs");
        const live = normalizePageContent(json, cmsUrl);
        if (live.found) pageContentCache.set(slug, live);
        return pageContentCache.get(slug) || live;
      })
      .catch(() => {
        pageRequests.delete(slug);
        return pageContentCache.get(slug) || missingPage("none");
      });

    pageRequests.set(slug, request);
  }

  return pageRequests.get(slug);
}

export function fetchPageCopy(slug) {
  return fetchPageContent(slug).then((content) => content.copy);
}

/** Fetch published products from CMS */
export function fetchShopProducts(category) {
  if (!shopProductsRequest) {
    const cmsUrl = getCmsUrl();
    const query = new URLSearchParams({
      limit: "50",
      depth: "1",
    });

    shopProductsRequest = fetch(`${cmsUrl}/api/shop-products?${query}`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Shop products request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => (Array.isArray(data?.docs) ? data.docs : []))
      .catch(() => {
        shopProductsRequest = null;
        return [];
      });
  }

  return shopProductsRequest.then((products) => {
    if (!category) return products;
    return products.filter((p) => p.category === category);
  });
}

/** Fetch team members and profiles from CMS */
let teamMembersRequest = null;

export function fetchTeamMembers() {
  if (!teamMembersRequest) {
    const cmsUrl = getCmsUrl();
    const query = new URLSearchParams({
      limit: "50",
      sort: "order",
      depth: "1",
    });

    teamMembersRequest = fetch(`${cmsUrl}/api/team-members?${query}`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`TeamMembers request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const docs = Array.isArray(data?.docs) ? data.docs : [];
        return docs.map((member) => {
          if (!member?.image?.url || member.image.url.startsWith("http")) return member;
          return {
            ...member,
            image: {
              ...member.image,
              url: `${cmsUrl}${member.image.url}`,
            },
          };
        });
      })
      .catch(() => {
        teamMembersRequest = null;
        return [];
      });
  }

  return teamMembersRequest;
}

export function clearCmsPageCache() {
  pageRequests.clear();
  pageContentCache.clear();
  for (const [slug, content] of compiledPageContent) {
    pageContentCache.set(slug, content);
  }
  shopProductsRequest = null;
  teamMembersRequest = null;
}
