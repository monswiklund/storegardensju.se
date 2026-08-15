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

function getCmsWriteUrl() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3002";
  }
  return getCmsUrl();
}

const pageRequests = new Map();
let shopProductsRequest = null;

const appearanceOptions = Object.freeze({
  pageTheme: new Set(["original", "linen", "clay", "forest"]),
  heroLayout: new Set(["original", "centered", "editorial"]),
  heroOverlay: new Set(["original", "soft", "strong"]),
  sectionSpacing: new Set(["original", "compact", "airy"]),
});

export function normalizePageAppearance(doc) {
  return Object.freeze(Object.fromEntries(
    Object.entries(appearanceOptions).map(([key, allowed]) => [
      key,
      allowed.has(doc?.[key]) ? doc[key] : "original",
    ]),
  ));
}

/** Convert Payload's editor rows into an immutable lookup used by page components. */
export function normalizePageContent(payload) {
  const doc = payload?.docs?.[0];
  if (!doc) return { found: false, copy: {}, lists: {}, images: {}, socialImage: null, appearance: normalizePageAppearance() };
  const rows = Array.isArray(doc.copy) ? doc.copy : [];
  const contentLists = Array.isArray(doc.contentLists) ? doc.contentLists : [];
  const imageSlots = Array.isArray(doc.imageSlots) ? doc.imageSlots : [];
  return Object.freeze({
    found: true,
    copy: Object.freeze(Object.fromEntries(
      rows
        .filter(
          (row) =>
            typeof row?.key === "string" &&
            typeof row?.value === "string" &&
            row.value.trim() !== "",
        )
        .map((row) => [row.key, row.value]),
    )),
    lists: Object.freeze(Object.fromEntries(
      contentLists
        .filter((list) => typeof list?.key === "string")
        .map((list) => [list.key, Object.freeze(Array.isArray(list.items) ? list.items : [])]),
    )),
    images: Object.freeze(Object.fromEntries(
      imageSlots.filter((slot) => typeof slot?.key === "string").map((slot) => [slot.key, slot.image || null]),
    )),
    socialImage: doc.socialImage || null,
    appearance: normalizePageAppearance(doc),
  });
}

export function normalizePageCopy(payload) {
  return normalizePageContent(payload).copy;
}

/** Fetch one published page document; callers keep their compiled copy as fallback. */
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
      .then(normalizePageContent)
      .catch(() => {
        pageRequests.delete(slug);
        return { found: false, copy: {}, lists: {}, images: {}, socialImage: null, appearance: normalizePageAppearance() };
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

/** Save an inquiry to CMS log in the background without blocking email */
export async function logInquiry(data) {
  try {
    const cmsUrl = getCmsWriteUrl();
    await fetch(`${cmsUrl}/api/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...data,
        status: "new",
      }),
    });
  } catch {
    // Non-blocking log, swallow gracefully
  }
}

export function clearCmsPageCache() {
  pageRequests.clear();
  shopProductsRequest = null;
  teamMembersRequest = null;
}
