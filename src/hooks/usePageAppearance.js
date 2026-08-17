import { useEffect, useState } from "react";
import { fetchPageContent, normalizePageAppearance } from "../services/cmsService";
import { extractPreviewData } from "../services/livePreviewBridge.js";

const originalAppearance = normalizePageAppearance();

export function pageSlugForPath(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/event/brollop")) return "wedding";
  if (pathname.startsWith("/event")) return "event";
  if (pathname.startsWith("/gruppdagar") || pathname.startsWith("/mohippa")) return "group-days";
  if (pathname.startsWith("/kurser/yoga")) return "yoga";
  if (pathname.startsWith("/kurser/konst") || pathname.startsWith("/konst")) return "art";
  if (pathname.startsWith("/kurser")) return "courses";
  if (pathname.startsWith("/galleri")) return "gallery";
  if (pathname.startsWith("/butik")) return "shop";
  if (pathname.startsWith("/om-oss")) return "about";
  if (pathname.startsWith("/kontakt")) return "contact";
  return null;
}

export default function usePageAppearance(slug) {
  const [appearance, setAppearance] = useState(originalAppearance);

  useEffect(() => {
    let active = true;
    setAppearance(originalAppearance);
    if (!slug) return () => { active = false; };

    fetchPageContent(slug).then((content) => {
      if (active && content.found) setAppearance(content.appearance);
    });

    const handleMessage = (event) => {
      const data = extractPreviewData(event);
      if (active && data?.slug === slug) setAppearance(normalizePageAppearance(data));
    };
    window.addEventListener("message", handleMessage);
    return () => {
      active = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [slug]);

  return appearance;
}
