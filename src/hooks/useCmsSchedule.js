import { useEffect, useState } from "react";
import { fetchCmsSchedule, resolveSchedule } from "../services/eventsService.js";

/**
 * The schedule a page shows: the build's export at first render (the same the prerendered HTML
 * has), replaced by a complete live answer. When the live read fails the export stays.
 * `settled` turns true once the live read has answered either way.
 */
export default function useCmsSchedule() {
  const [schedule, setSchedule] = useState(() => ({ ...resolveSchedule(null), settled: false }));

  useEffect(() => {
    let active = true;
    fetchCmsSchedule().then((live) => {
      if (!active) return;
      setSchedule((current) => ({ ...(live.source === "cms" ? live : current), settled: true }));
    });
    return () => {
      active = false;
    };
  }, []);

  return schedule;
}
