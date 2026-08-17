import { getCmsUrl } from "./cmsService";
import { cdnAsset } from "../config/cdnAssets";

const absoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/images/")) return cdnAsset(url);
  const normalizedPath = url.replace(/^\/api\/media\/file\//, "/media/");
  return `${getCmsUrl()}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
};

export function resolveMediaUrl(media, size) {
  if (!media || typeof media !== "object") return null;
  const sizeUrl = size && media.sizes?.[size]?.url;
  const sizeFilename = size && media.sizes?.[size]?.filename;
  const sizeFileUrl = sizeFilename ? `/media/${sizeFilename}` : null;
  const mainFileUrl = media.filename ? `/media/${media.filename}` : null;
  return absoluteUrl(sizeUrl || sizeFileUrl || media.url || mainFileUrl || media.externalUrl);
}

export function normalizeMedia(media, size) {
  if (!media || typeof media !== "object") return null;
  const src = resolveMediaUrl(media, size);
  if (!src) return null;
  return {
    id: media.id,
    src,
    url: src,
    alt: media.alt || media.displayName || "",
    width: media.sizes?.[size]?.width || media.width,
    height: media.sizes?.[size]?.height || media.height,
  };
}

export function normalizeMediaList(value, size) {
  return (Array.isArray(value) ? value : [])
    .map((media) => normalizeMedia(media, size))
    .filter(Boolean);
}
