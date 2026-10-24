import { useEffect, useState } from "react";
import { fetchCmsSchedule, resolveSchedule } from "../services/eventsService.js";

/**
 * The schedule a page shows: the build's export at first render (the same the prerendered HTML
 * has), replaced by a complete live answer. When the live read fails the export stays.
 */
export default function useCmsSchedule() {
  const [schedule, setSchedule] = useState(() => resolveSchedule(null));

  useEffect(() => {
    let active = true;
    fetchCmsSchedule().then((live) => {
      if (active && live.source === "cms") setSchedule(live);
    });
    return () => {
      active = false;
    };
  }, []);

  return schedule;
}
