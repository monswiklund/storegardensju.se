import { useCallback, useEffect, useState } from "react";
import { fetchPageCopy, getPageContentSync, getPageCopySync } from "../services/cmsService";

function highlightAndScrollElement(key, value, sectionId) {
  try {
    let targetElement = null;

    // 1. Try finding by matching text value in document
    if (value && typeof value === "string" && value.trim().length > 2) {
      const searchSnippet = value.trim().substring(0, 35);
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const nodeVal = walker.currentNode.nodeValue;
        if (nodeVal && nodeVal.includes(searchSnippet)) {
          let el = walker.currentNode.parentElement;
          if (el && el.parentElement && ["SPAN", "STRONG", "EM", "A", "B"].includes(el.tagName)) {
            el = el.parentElement;
          }
          targetElement = el;
          break;
        }
      }
    }

    // 2. Try section ID or key prefix mapping if not found by text
    if (!targetElement && sectionId) {
      targetElement =
        document.querySelector(`[data-section="${sectionId}"]`) ||
        document.getElementById(sectionId) ||
        document.querySelector(`.${sectionId}`);
    }

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

      if (!document.getElementById("sg-live-highlight-style")) {
        const style = document.createElement("style");
        style.id = "sg-live-highlight-style";
        style.textContent = `
          @keyframes sg-pulse-ring {
            0% { outline: 3px solid hsl(160, 32%, 50%); box-shadow: 0 0 0 0 hsla(160, 32%, 50%, 0.7); }
            70% { outline: 3px solid hsl(160, 32%, 50%); box-shadow: 0 0 0 10px hsla(160, 32%, 50%, 0); }
            100% { outline: 3px solid transparent; box-shadow: 0 0 0 0 hsla(160, 32%, 50%, 0); }
          }
          .sg-live-highlight {
            outline: 3px solid hsl(160, 32%, 50%) !important;
            outline-offset: 4px !important;
            border-radius: 4px !important;
            animation: sg-pulse-ring 2.2s ease-out !important;
            transition: outline 0.3s ease !important;
          }
        `;
        document.head.appendChild(style);
      }

      targetElement.classList.remove("sg-live-highlight");
      // Trigger reflow to restart animation
      void targetElement.offsetWidth;
      targetElement.classList.add("sg-live-highlight");

      setTimeout(() => {
        targetElement.classList.remove("sg-live-highlight");
      }, 2300);
    }
  } catch {
    // Ignore any highlight query error
  }
}

/** Resolve editor-owned text without making a CMS outage visible to visitors. */
export default function usePageCopy(slug) {
  const [values, setValues] = useState(() => getPageContentSync(slug)?.copy || {});

  useEffect(() => {
    let active = true;

    fetchPageCopy(slug).then((nextValues) => {
      if (active && nextValues && Object.keys(nextValues).length > 0) {
        setValues(nextValues);
      }
    });

    // Support live preview updates & element highlighting from Payload CMS
    const handleMessage = (event) => {
      try {
        if (!event.data) return;

        // Direct single key live update
        if (event.data.type === "storegardensju-live-copy") {
          const { key, value } = event.data;
          if (key && typeof value === "string" && active) {
            setValues((prev) => ({ ...prev, [key]: value }));
          }
          return;
        }

        // Element highlight message from editor field click/focus
        if (event.data.type === "storegardensju-highlight-field") {
          highlightAndScrollElement(
            event.data.key,
            event.data.value,
            event.data.sectionId,
          );
          return;
        }

        // Live preview data update from Payload
        const payloadData = event.data.data || event.data;
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

  return useCallback(
    (key) => {
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
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : "";
    },
    [values, slug],
  );
}

export function useSiteCopy() {
  return usePageCopy("site");
}

export { getPageCopySync };
