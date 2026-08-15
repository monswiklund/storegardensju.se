import { useCallback, useEffect, useState } from "react";
import { fetchPageContent } from "../services/cmsService";
import { resolveMediaUrl } from "../services/mediaService";
import { cdnAsset } from "../config/cdnAssets";

export default function usePageMedia(slug) {
  const [content, setContent] = useState({ status: "loading", images: {} });

  useEffect(() => {
    let active = true;
    fetchPageContent(slug).then((next) => {
      if (active) setContent({ status: next.found ? "ready" : "error", images: next.images || {} });
    });

    const handleMessage = (event) => {
      const data = event.data?.data || event.data;
      if (!active || data?.slug !== slug || !Array.isArray(data.imageSlots)) return;
      setContent({
        status: "ready",
        images: Object.fromEntries(data.imageSlots.filter((slot) => slot?.key).map((slot) => [slot.key, slot.image || null])),
      });
    };
    window.addEventListener("message", handleMessage);
    return () => {
      active = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [slug]);

  return useCallback((key, fallback, size) => {
    if (content.status !== "ready") return cdnAsset(fallback);
    return resolveMediaUrl(content.images[key], size);
  }, [content]);
}
