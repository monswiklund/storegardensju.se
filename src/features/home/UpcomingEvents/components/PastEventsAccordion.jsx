import PropTypes from "prop-types";
import { useState, useEffect, useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import PastEventModal from "./PastEventModal.jsx";
import {
  PAST_EVENT_CATEGORIES,
  eventMatchesCategory,
  groupPastEvents,
} from "../pastEventsUtils.js";
import "../../PastEvents/PastEvents.css";

const pastEventHistoryStateKey = "__storegardenPastEvent";
const INITIAL_LIMIT = 5;

function PastEventsAccordion({ events }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [hasUserHovered, setHasUserHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const requestedEventId = searchParams.get("pastEvent");

  const handleItemMouseEnter = () => {
    if (!hasUserHovered) {
      setHasUserHovered(true);
      setActiveIndex(null);
    }
  };

  // Consolidate recurring series (e.g. weekly/daily yoga passes)
  const groupedEvents = useMemo(() => groupPastEvents(events), [events]);

  // Counts for category badges
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const cat of PAST_EVENT_CATEGORIES) {
      counts[cat.id] = groupedEvents.filter((e) =>
        eventMatchesCategory(e, cat.id)
      ).length;
    }
    return counts;
  }, [groupedEvents]);

  // Filter by active category
  const filteredEvents = useMemo(() => {
    return groupedEvents.filter((e) =>
      eventMatchesCategory(e, activeCategory)
    );
  }, [groupedEvents, activeCategory]);

  // Split into primary and extra items for animated accordion reveal
  const primaryEvents = useMemo(
    () => filteredEvents.slice(0, INITIAL_LIMIT),
    [filteredEvents]
  );
  const extraEvents = useMemo(
    () => filteredEvents.slice(INITIAL_LIMIT),
    [filteredEvents]
  );

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

  // Scroll-listener that calculates which past event item is closest to the vertical center of the screen
  // Disabled once the user hovers over an item to prevent fighting with manual cursor interaction.
  useEffect(() => {
    if (typeof window === "undefined" || hasUserHovered) {
      setActiveIndex(null);
      return;
    }

    const handleScroll = () => {
      if (hasUserHovered) return;
      const elements = document.querySelectorAll(".past-event-item");
      if (!elements.length) return;

      const viewportCenter = window.innerHeight / 2;
      let closestIdx = null;
      let minDistance = Infinity;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - viewportCenter);

        // Only consider elements that are reasonably within the viewport area
        if (rect.bottom > 100 && rect.top < window.innerHeight - 100) {
          if (distance < minDistance) {
            minDistance = distance;
            const idx = Number(el.getAttribute("data-index"));
            if (!Number.isNaN(idx)) {
              closestIdx = idx;
            }
          }
        }
      });

      if (closestIdx !== null) {
        setActiveIndex(closestIdx);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredEvents.length, isExpanded, hasUserHovered]);

  const renderEventArticle = (event, index) => {
    const dateParts = (event.date || "").split(" ");
    const day = dateParts[0] || "";
    const month = dateParts[1]
      ? dateParts[1].substring(0, 3).toUpperCase()
      : "";
    const year = dateParts[2] || "";

    const thumbImage = event.images?.[0] || event.image;

    return (
      <article
        key={event.id || `${event.title}-${index}`}
        data-index={index}
        className={`past-event-item ${
          thumbImage?.src ? "" : "past-event-item--no-image"
        } ${!hasUserHovered && activeIndex === index ? "is-highlighted" : ""}`}
        aria-labelledby={`past-event-title-${index}`}
        onClick={() => openEvent(event)}
        onMouseEnter={handleItemMouseEnter}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEvent(event);
          }
        }}
      >
        {/* Left component: Date Stack */}
        <div className="past-event-date-side">
          <span className="date-day">{day}</span>
          <span className="date-month">{month}</span>
          {year && <span className="date-year">{year}</span>}
        </div>

        {/* Center component: Vertical timeline dot & line */}
        <div className="past-event-timeline-marker">
          <div className="timeline-marker-dot" />
          <div className="timeline-marker-line" />
        </div>

        {/* Next component: Thumbnail Image */}
        {thumbImage?.src && (
          <div className="past-event-thumbnail">
            <img
              src={thumbImage.src}
              alt={thumbImage.alt || ""}
              loading="lazy"
            />
          </div>
        )}

        {/* Next component: Info Area */}
        <div className="past-event-info">
          <div className="past-event-meta-top">
            <span className="past-event-time">
              {event.time || "12:00 - 23:59"}
            </span>
            {event.badge && (
              <span className="past-event-badge">{event.badge}</span>
            )}
          </div>
          <h3
            id={`past-event-title-${index}`}
            className="past-event-title"
          >
            {event.title}
          </h3>
          <span className="past-event-location">
            {event.location}
          </span>
        </div>

        {/* Right component: Action Link */}
        <div className="past-event-action-side">
          <span className="past-event-open-link">
            <span>Läs mer</span>
            <ArrowUpRight size={16} />
          </span>
        </div>
      </article>
    );
  };

  return (
    <div
      id="past-events-inner"
      className="past-events-section"
      data-section="past-events"
    >
      {/* Mobile-only header row */}
      <div className="past-events-mobile-header mobile-only">
        <span className="past-events-eyebrow">TIDIGARE EVENEMANG</span>
      </div>

      <div className="past-events-split-layout">
        {/* Left Column (Desktop only) */}
        <div className="past-events-info-col desktop-only">
          <span className="past-events-eyebrow">TIDIGARE EVENEMANG</span>
          <h2 className="past-events-heading">Tidigare evenemang</h2>
          <p className="past-events-intro">
            Ett urval av kurser, öppna ateljékvällar och samarbeten.
          </p>

          {/* Desktop Filter Pills */}
          <div
            className="past-events-filter-bar"
            role="tablist"
            aria-label="Filtrera tidigare evenemang efter kategori"
          >
            {PAST_EVENT_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`past-events-filter-btn ${
                    isActive ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsExpanded(false);
                  }}
                >
                  <span className="filter-label">{cat.label}</span>
                  <span className="filter-count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column / Main List (Timeline) */}
        <div className="past-events-timeline-col">
          {/* Mobile Filter Pills */}
          <div
            className="past-events-filter-bar past-events-filter-bar--mobile mobile-only"
            role="tablist"
            aria-label="Filtrera tidigare evenemang efter kategori"
          >
            {PAST_EVENT_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`past-events-filter-btn ${
                    isActive ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsExpanded(false);
                  }}
                >
                  <span className="filter-label">{cat.label}</span>
                  <span className="filter-count">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="past-events-list" onMouseEnter={handleItemMouseEnter}>
            {filteredEvents.length === 0 && (
              <div className="past-events-empty">
                <p>Inga tidigare evenemang i denna kategori.</p>
              </div>
            )}

            {/* Always visible primary items */}
            {primaryEvents.map((event, index) =>
              renderEventArticle(event, index)
            )}

            {/* Expandable extra items with smooth drop animation */}
            {extraEvents.length > 0 && (
              <div
                id="past-events-extra-content"
                className={`past-events-extra-wrapper ${
                  isExpanded ? "is-expanded" : "is-collapsed"
                }`}
                aria-hidden={!isExpanded}
              >
                <div className="past-events-extra-inner">
                  {extraEvents.map((event, index) =>
                    renderEventArticle(event, primaryEvents.length + index)
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Progressive Disclosure: Show more / less button */}
          {filteredEvents.length > INITIAL_LIMIT && (
            <div className="past-events-expand-wrapper">
              <button
                type="button"
                className="past-events-expand-btn"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-controls="past-events-extra-content"
              >
                <span>
                  {isExpanded
                    ? "Visa färre"
                    : `Visa fler (${extraEvents.length})`}
                </span>
                <ChevronDown
                  className={`past-events-expand-icon ${
                    isExpanded ? "is-rotated" : ""
                  }`}
                  size={18}
                />
              </button>
            </div>
          )}
        </div>
      </div>

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
