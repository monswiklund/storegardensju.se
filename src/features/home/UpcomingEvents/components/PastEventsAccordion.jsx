import PropTypes from "prop-types";
import { useState, useEffect, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import PastEventModal from "./PastEventModal.jsx";
import { bandImages, groupPastEvents, pastEventType, pastYearGroups } from "../pastEventsUtils.js";
import "../../PastEvents/PastEvents.css";
import usePageCopy from "../../../../hooks/usePageCopy.js";

const pastEventHistoryStateKey = "__storegardenPastEvent";
const INITIAL_LIMIT = 8;

// Each row keeps a name so the browser can glide it into place when the list grows or shrinks.
const rowName = (event, index) => `past-row-${String(event.id || index).replace(/[^\w-]/g, "-")}`;

function PastEventsAccordion({ events }) {
  const copy = usePageCopy("home");
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandButtonRef = useRef(null);
  const requestedEventId = searchParams.get("pastEvent");

  // Consolidate recurring series (e.g. weekly/daily yoga passes)
  const groupedEvents = useMemo(() => groupPastEvents(events), [events]);

  const band = useMemo(() => bandImages(groupedEvents), [groupedEvents]);
  const shownEvents = isExpanded ? groupedEvents : groupedEvents.slice(0, INITIAL_LIMIT);
  const hiddenCount = groupedEvents.length - INITIAL_LIMIT;

  const toggleExpanded = () => {
    const expanding = !isExpanded;
    const button = expandButtonRef.current;
    const buttonTop = button?.getBoundingClientRect().top ?? 0;
    const update = () => {
      flushSync(() => setIsExpanded(expanding));
      // Fewer rows: keep the button where it was on screen, so the list folds up into it
      // instead of the page jumping away from the visitor.
      if (!expanding && button) {
        const y = window.scrollY + button.getBoundingClientRect().top - buttonTop;
        window.storegardenLenis?.scrollTo?.(y, { immediate: true, force: true });
        window.scrollTo({ top: y, behavior: "auto" });
      }
    };

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) {
      update();
      return;
    }
    const root = document.documentElement;
    root.classList.add("past-list-moving");
    document.startViewTransition(update).finished.finally(() => root.classList.remove("past-list-moving"));
  };

  const openEvent = (event) => {
    setSelectedEvent(event);
    if (!event.id) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("pastEvent", event.id);
    setSearchParams(nextParams, {
      state: {
        ...(location.state || {}),
        [pastEventHistoryStateKey]: true,
      },
    });
  };

  const closeEvent = () => {
    setSelectedEvent(null);
    if (!requestedEventId) return;

    if (location.state?.[pastEventHistoryStateKey]) {
      navigate(-1);
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("pastEvent");
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (!requestedEventId) {
      setSelectedEvent(null);
      return;
    }

    // 1. Check in grouped events
    let match = groupedEvents.find((e) => e.id === requestedEventId);

    // 2. Check inside child sessions of grouped events
    if (!match) {
      for (const group of groupedEvents) {
        if (group.sessions) {
          const sessionMatch = group.sessions.find(
            (s) => s.id === requestedEventId
          );
          if (sessionMatch) {
            match = sessionMatch;
            break;
          }
        }
      }
    }

    // 3. Fallback to raw events list
    if (!match) {
      match = events.find((e) => e.id === requestedEventId);
    }

    if (match) {
      setSelectedEvent(match);
    }
  }, [events, groupedEvents, requestedEventId]);

  let rowIndex = 0;
  const renderRow = (event) => {
    const index = rowIndex++;
    return (
      <li key={event.id || `${event.title}-${index}`} style={{ viewTransitionName: rowName(event, index) }}>
        <button type="button" className="past-row" onClick={() => openEvent(event)}>
          {/* The year stands beside the group, so the row keeps day and month. */}
          <span className="past-row-date">{(event.date || "").split(" ").slice(0, 2).join(" ").toLowerCase()}</span>
          <span className="past-row-title">
            {event.title}
            {event.badge && <span className="past-row-badge">{event.badge}</span>}
          </span>
          <span className="past-row-type">{pastEventType(event)}</span>
          <ArrowUpRight className="past-row-arrow" size={18} aria-hidden="true" />
        </button>
      </li>
    );
  };

  return (
    <div
      id="past-events-inner"
      className="past-events-section"
      data-section="past-events"
    >
      <div className="past-events-header">
        <span className="past-events-eyebrow">{copy("events.past.eyebrow")}</span>
        <h2 className="past-events-heading">{copy("events.past.title")}</h2>
        <p className="past-events-intro">{copy("events.past.body")}</p>
      </div>

      {/* A few different photos carry the feeling once, instead of one picture on every row. */}
      {band.length > 0 && (
        <ul className={`past-band past-band--${band.length}`}>
          {band.map(({ image, event }) => (
            <li key={image.src}>
              <button type="button" className="past-band-photo" onClick={() => openEvent(event)} aria-label={event.title}>
                <img src={image.src} alt={image.alt || ""} loading="lazy" decoding="async" />
                <span className="past-band-caption" aria-hidden="true">{event.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="past-years">
        {pastYearGroups(shownEvents).map(({ year, events: yearEvents }) => (
          <section key={year} className="past-year" aria-label={year}>
            <h3 className="past-year-label">{year}</h3>
            <ul className="past-year-list">{yearEvents.map(renderRow)}</ul>
          </section>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="past-events-expand-wrapper">
          <button
            type="button"
            ref={expandButtonRef}
            className="btn btn--secondary past-events-expand-btn"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded
                ? copy("events.past.show-less", "Visa färre")
                : `${copy("events.past.show-more", "Visa fler")} (${hiddenCount})`}
            </span>
            <ChevronDown className={`past-events-expand-icon ${isExpanded ? "is-rotated" : ""}`} size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedEvent && (
        <PastEventModal event={selectedEvent} onClose={closeEvent} />
      )}
    </div>
  );
}

PastEventsAccordion.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string,
      category: PropTypes.string,
      description: PropTypes.string,
      moments: PropTypes.arrayOf(
        PropTypes.shape({
          time: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          description: PropTypes.string,
          tone: PropTypes.oneOf(["yoga", "creative"]),
        })
      ),
      location: PropTypes.string,
      artists: PropTypes.string,
      link: PropTypes.string,
      linkLabel: PropTypes.string,
      links: PropTypes.arrayOf(
        PropTypes.shape({
          href: PropTypes.string.isRequired,
          label: PropTypes.string,
        })
      ),
      image: PropTypes.shape({
        src: PropTypes.string,
        alt: PropTypes.string,
      }),
      images: PropTypes.arrayOf(
        PropTypes.shape({
          src: PropTypes.string,
          alt: PropTypes.string,
        })
      ),
    })
  ).isRequired,
};

export default PastEventsAccordion;
