import { useEffect, useMemo, useState } from "react";
import { fetchPublicEvents } from "../services/eventsService";
import { toUiEvent } from "../features/home/UpcomingEvents/toUiEvent.js";
import { useSiteCopy } from "./usePageCopy.js";

/** The farm's upcoming and past events, shaped for the event cards and the past-events list. */
export default function usePublicEvents() {
  const siteCopy = useSiteCopy();
  const [eventsData, setEventsData] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPublicEvents();
        if (!active) return;
        setEventsData({ upcoming: data.upcoming, past: data.past });
        // Neither the CMS nor this build's export had a calendar: say so instead of "nothing planned".
        if (data.source === "none") setError(siteCopy("ui.events-fetch-error"));
      } catch {
        if (!active) return;
        setEventsData({ upcoming: [], past: [] });
        setError(siteCopy("ui.events-fetch-error"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    run();

    return () => {
      active = false;
    };
  }, [siteCopy]);

  // sortAt is a course's next session (its last once it is over), so a running course is filed
  // by when it meets next, not by the day it began.
  const upcomingEvents = useMemo(() => {
    return eventsData.upcoming
      .map((event) => toUiEvent(event))
      .sort((a, b) => new Date(a.sortAt || 0) - new Date(b.sortAt || 0));
  }, [eventsData.upcoming]);

  const pastEvents = useMemo(() => {
    // A cancelled event never took place, so it is no memory to show.
    return eventsData.past
      .filter((event) => event.status !== "cancelled")
      .map((event) => toUiEvent(event))
      .sort((a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0));
  }, [eventsData.past]);

  return { upcomingEvents, pastEvents, loading, error };
}
