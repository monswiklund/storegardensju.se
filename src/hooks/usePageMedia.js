import { useCallback, useEffect, useState } from "react";
import { fetchPageContent, getPageContentSync } from "../services/cmsService";
import { fetchMediaById, resolveMediaUrl } from "../services/mediaService";
import { cdnAsset } from "../config/cdnAssets";
import { extractPreviewData } from "../services/livePreviewBridge.js";

const sameId = (a, b) => a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b);

export default function usePageMedia(slug) {
  const [content, setContent] = useState(() => {
    const sync = getPageContentSync(slug);
    return {
      status: sync?.found ? "ready" : "loading",
      images: sync?.images || {},
    };
  });

  useEffect(() => {
    let active = true;
    // Once the editor form has spoken, a slower CMS response is older than what is shown.
    let previewSeen = false;
    fetchPageContent(slug).then((next) => {
      if (!active || previewSeen) return;
      // A CMS answer is authoritative even for a missing page; a snapshot (failed request)
      // only fills in when nothing was shown yet.
      if (next?.source === "cms") {
        setContent({ status: "ready", images: next.images || {} });
      } else {
        setContent((prev) =>
          prev.status === "loading" ? { status: next?.found ? "ready" : "error", images: next?.images || {} } : prev,
        );
      }
    });

    const handleMessage = (event) => {
      const data = extractPreviewData(event);
      if (!active || data?.slug !== slug || !Array.isArray(data.imageSlots)) return;
      previewSeen = true;
      const slots = data.imageSlots.filter((slot) => slot?.key);
      // The editor form holds uploads as bare ids; keep the known document for an
      // unchanged id and look up a new one, instead of falling back to the code image.
      setContent((prev) => ({
        status: "ready",
        images: Object.fromEntries(
          slots.map(({ key, image }) => {
            if (!image || typeof image === "object") return [key, image || null];
            const known = prev.images[key];
            return [key, known && typeof known === "object" && sameId(known.id, image) ? known : image];
          }),
        ),
      }));
      for (const { key, image } of slots) {
        if (!image || typeof image === "object") continue;
        fetchMediaById(image).then((doc) => {
          if (!active || !doc) return;
          // Only fill the slot if it still waits for this id; a newer selection wins.
          setContent((prev) =>
            prev.images[key] === image ? { ...prev, images: { ...prev.images, [key]: doc } } : prev,
          );
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      active = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [slug]);

  return useCallback((key, fallback, size) => {
    const codeImage = fallback ? cdnAsset(fallback) : null;
    if (content.status !== "ready") return codeImage;
    if (!Object.prototype.hasOwnProperty.call(content.images, key)) return codeImage;
    const image = content.images[key];
    // A present slot without an image means the editor removed it; show none.
    if (image === null || image === undefined) return null;
    // A bare id still being looked up, or a document without a usable file.
    return resolveMediaUrl(image, size) || codeImage;
  }, [content]);
}
