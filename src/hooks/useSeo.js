import { useEffect } from "react";
import { canonicalUrl } from "../config/seoMeta.js";

/**
 * Per-route SEO: document title, meta description, canonical URL and
 * optional JSON-LD structured data. Restores previous values on unmount
 * so navigating back to a page without useSeo falls back to index.html defaults.
 *
 * jsonLd must be a module-level constant (stable reference), otherwise
 * the effect re-runs every render.
 */
export function useSeo({ title, description, path, jsonLd }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content");
    if (description && metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href");
    if (canonical && path != null) {
      canonical.setAttribute("href", canonicalUrl(path));
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    const prevOgUrl = ogUrl?.getAttribute("content");
    if (ogUrl && path != null) {
      ogUrl.setAttribute("content", canonicalUrl(path));
    }

    let script;
    if (jsonLd) {
      script =
        document.querySelector('script[data-seo-jsonld="route"]') ||
        document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "route";
      script.text = JSON.stringify(jsonLd);
      if (!script.parentNode) document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute("content", prevDesc);
      if (canonical && prevCanonical) canonical.setAttribute("href", prevCanonical);
      if (ogUrl && prevOgUrl) ogUrl.setAttribute("content", prevOgUrl);
      script?.remove();
    };
  }, [title, description, path, jsonLd]);
}
