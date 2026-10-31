import { useEffect, useState } from "react";
import { getCmsUrl } from "../services/cmsService";
import { fetchAllPublished, inDragOrder, projectArtwork, projectCeramic } from "../data/cmsProjection.js";
import CMS_CONTENT from "../data/cmsContent.generated.js";

const requests = new Map();

/** Every published document of an ordered collection, or null when the CMS could not be read completely. */
function fetchOrdered(collection, project) {
  if (!requests.has(collection)) {
    const cmsUrl = getCmsUrl();
    const request = fetchAllPublished(cmsUrl, collection)
      .then((docs) => inDragOrder(docs.map((doc) => project(doc, cmsUrl))))
      .catch(() => {
        requests.delete(collection);
        return null;
      });
    requests.set(collection, request);
  }
  return requests.get(collection);
}

/**
 * First what the build exported, then the CMS's live answer, so a piece published since the last
 * build shows at once. A failed read keeps what the build shipped.
 */
function useOrdered(collection, project, snapshot) {
  const [works, setWorks] = useState(() => snapshot || []);

  useEffect(() => {
    let active = true;
    fetchOrdered(collection, project).then((live) => {
      if (active && live) setWorks(live);
    });
    return () => {
      active = false;
    };
  }, [collection, project]);

  return works;
}

/** Ann's paintings and studio photos. */
export default function useArtworks() {
  return useOrdered("artworks", projectArtwork, CMS_CONTENT?.artworks);
}

/** Ann's ceramics. */
export function useCeramics() {
  return useOrdered("ceramics", projectCeramic, CMS_CONTENT?.ceramics);
}
