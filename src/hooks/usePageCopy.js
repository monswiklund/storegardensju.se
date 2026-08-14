import { useCallback, useEffect, useState } from "react";
import { fetchPageCopy } from "../services/cmsService";

/** Resolve editor-owned text without making a CMS outage visible to visitors. */
export default function usePageCopy(slug) {
  const [values, setValues] = useState({});

  useEffect(() => {
    let active = true;
    fetchPageCopy(slug).then((nextValues) => {
      if (active) setValues(nextValues);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  return useCallback(
    (key, fallback) => {
      const value = values[key];
      return typeof value === "string" && value.trim() !== "" ? value : fallback;
    },
    [values],
  );
}
