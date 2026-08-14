const configuredCmsUrl = import.meta.env.VITE_CMS_URL?.trim();
const CMS_URL = (configuredCmsUrl || "https://cms.storegardensju.se").replace(/\/$/, "");

const pageRequests = new Map();

/** Convert Payload's editor rows into an immutable lookup used by page components. */
export function normalizePageCopy(payload) {
  const rows = payload?.docs?.[0]?.copy;
  if (!Array.isArray(rows)) return {};

  return Object.freeze(
    Object.fromEntries(
      rows
        .filter(
          (row) =>
            typeof row?.key === "string" &&
            typeof row?.value === "string" &&
            row.value.trim() !== "",
        )
        .map((row) => [row.key, row.value]),
    ),
  );
}

/** Fetch one published page document; callers keep their compiled copy as fallback. */
export function fetchPageCopy(slug) {
  if (!pageRequests.has(slug)) {
    const query = new URLSearchParams({
      "where[slug][equals]": slug,
      limit: "1",
      depth: "0",
    });

    const request = fetch(`${CMS_URL}/api/pages?${query}`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`CMS request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(normalizePageCopy)
      .catch(() => {
        pageRequests.delete(slug);
        return {};
      });

    pageRequests.set(slug, request);
  }

  return pageRequests.get(slug);
}

export function clearCmsPageCache() {
  pageRequests.clear();
}
