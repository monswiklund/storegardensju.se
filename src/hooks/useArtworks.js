import { useEffect, useState } from "react";
import { getCmsUrl } from "../services/cmsService";
import { fetchAllPublished, orderArtworks, projectArtwork } from "../data/cmsProjection.js";
import CMS_CONTENT from "../data/cmsContent.generated.js";

let request = null;

/** Every published artwork in drag order, or null when the CMS could not be read completely. */
export function fetchArtworks() {
  if (!request) {
    const cmsUrl = getCmsUrl();
    request = fetchAllPublished(cmsUrl, "artworks")
      .then((docs) => orderArtworks(docs.map((doc) => projectArtwork(doc, cmsUrl))))
      .catch(() => {
        request = null;
        return null;
      });
  }
  return request;
}

/**
 * Ann's works: first what the build exported, then the CMS's live answer, so a work published
 * since the last build shows at once. A failed read keeps what the build shipped.
 */
export default function useArtworks() {
  const [artworks, setArtworks] = useState(() => CMS_CONTENT?.artworks || []);

  useEffect(() => {
    let active = true;
    fetchArtworks().then((live) => {
      if (active && live) setArtworks(live);
    });
    return () => {
      active = false;
    };
  }, []);

  return artworks;
}
