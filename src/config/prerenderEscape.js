// Escaping for text the build writes into static HTML and XML (scripts/generate-route-pages.js).
// CMS copy reaches these sinks, so each helper covers what can break out of its context.

/** Inside a double-quoted attribute: & and " are the only characters that end or change it. */
export const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Element text. */
export const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** XML text and attributes (the sitemap). */
export const escapeXml = (value) => escapeHtml(value).replace(/"/g, "&quot;");

/** JSON inside <script>: a "<" in a string would let "</script>" end the block early. */
export const jsonForScript = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

/** The share image of an exported page (cmsProjection.projectMedia), or null. */
export function socialImageUrl(page) {
  const media = page?.socialImage;
  return media?.sizes?.hero?.url || media?.url || null;
}
