import { useCallback, useEffect, useState } from "react";
import { fetchPageContent, getPageContentSync, getPageCopySync } from "../services/cmsService";
import { extractPreviewData } from "../services/livePreviewBridge.js";

/** Resolve editor-owned text without making a CMS outage visible to visitors. */
export default function usePageCopy(slug) {
  const [values, setValues] = useState(() => getPageContentSync(slug)?.copy || {});

  useEffect(() => {
    let active = true;

    // A live page replaces the build's copy whole; a failed request keeps the build's copy.
    fetchPageContent(slug).then((content) => {
      if (active && content.found) setValues(content.copy);
    });

    // Payload remains the source of truth; only trusted preview-frame messages
    // may temporarily overlay the published values.
    const handleMessage = (event) => {
      try {
        const payloadData = extractPreviewData(event);
        if (payloadData?.slug === slug && Array.isArray(payloadData?.copy)) {
          const liveCopy = Object.fromEntries(
            payloadData.copy
              .filter((row) => row?.key && typeof row?.value === "string")
              .map((row) => [row.key, row.value]),
          );
          if (active) {
            setValues((prev) => ({ ...prev, ...liveCopy }));
          }
        }
      } catch {
        // ignore malformed message events
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      active = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [slug]);

  // `fallback` covers a key the CMS does not have yet; an empty CMS value is the
  // editor's choice to hide that text and is returned as "".
  return useCallback(
    (key, fallback = "") => {
      if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV !== "production" &&
        values &&
        Object.keys(values).length > 0 &&
        !Object.prototype.hasOwnProperty.call(values, key)
      ) {
        // Warn in development when a required CMS key is not configured
        console.warn(`[CMS Warning] Missing CMS copy key: "${slug}.${key}"`);
      }
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback;
    },
    [values, slug],
  );
}

export function useSiteCopy() {
  return usePageCopy("site");
}

export { getPageCopySync };
