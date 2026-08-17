import { useCallback, useEffect, useState } from "react";
import { fetchPageContent, getPageContentSync } from "../services/cmsService";

export default function usePageLists(slug) {
  const [lists, setLists] = useState(() => getPageContentSync(slug)?.lists || {});

  useEffect(() => {
    let active = true;
    fetchPageContent(slug).then((content) => {
      if (active && content.found) setLists(content.lists);
    });

    const handleMessage = (event) => {
      const data = event.data?.data || event.data;
      if (!active || data?.slug !== slug || !Array.isArray(data.contentLists)) return;
      setLists(Object.fromEntries(
        data.contentLists
          .filter((list) => typeof list?.key === "string")
          .map((list) => [list.key, Array.isArray(list.items) ? list.items : []]),
      ));
    };
    window.addEventListener("message", handleMessage);
    return () => {
      active = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [slug]);

  return useCallback(
    (key, fallback = []) => Object.prototype.hasOwnProperty.call(lists, key) ? lists[key] : fallback,
    [lists],
  );
}
