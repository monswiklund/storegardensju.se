import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowUpRight, Calendar } from "lucide-react";
import PastEventModal from "./PastEventModal.jsx";
import "../../PastEvents/PastEvents.css";

const pastEventHistoryStateKey = "__storegardenPastEvent";

function PastEventsAccordion({ events }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const requestedEventId = searchParams.get("pastEvent");

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
    const requestedEvent = events.find(
      (event) => event.id === requestedEventId
    );
    if (!requestedEvent) return;

    setShowAll(true);
    setSelectedEvent(requestedEvent);
  }, [events, requestedEventId]);

  // Scroll-listener that calculates which past event item is closest to the vertical center of the screen
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
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
    handleScroll(); // Initial check on load

    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAll, events.length]);

  const visibleEvents = showAll ? events : events.slice(0, 4);

  return (
    <div id="past-events-inner" className="past-events-section" data-section="past-events">
      {/* Mobile-only header row */}
      <div className="past-events-mobile-header mobile-only">
        <span className="past-events-eyebrow">TIDIGARE EVENEMANG</span>
        {events.length > 4 && (
          <button
            className="past-events-show-more-link"
            onClick={() => setShowAll(!showAll)}
          >
            <span>{showAll ? "Visa färre" : "Visa alla"}</span>
            <Calendar size={14} />
          </button>
        )}
      </div>

      <div className="past-events-split-layout">
        {/* Left Column (Desktop only) */}
        <div className="past-events-info-col desktop-only">
          <span className="past-events-eyebrow">TIDIGARE EVENEMANG</span>
          <h2 className="past-events-heading">Tidigare evenemang</h2>
          <p className="past-events-intro">
            Ett urval av kurser, öppna ateljékvällar och samarbeten.
          </p>
          
          {events.length > 4 && (
            <button
              className="past-events-show-more-btn"
              onClick={() => setShowAll(!showAll)}
            >
              <Calendar size={16} />
              <span>{showAll ? "Visa färre" : "Visa alla evenemang"}</span>
            </button>
          )}
        </div>

        {/* Right Column / Main List (Timeline) */}
        <div className="past-events-timeline-col">
          <div className="past-events-list">
            {visibleEvents.length === 0 && (
              <div className="past-events-empty">
                <p>Inga tidigare evenemang att visa just nu.</p>
              </div>
            )}

            {visibleEvents.map((event, index) => {
              const dateParts = event.date.split(" ");
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
                  } ${activeIndex === index ? "is-highlighted" : ""}`}
                  aria-labelledby={`past-event-title-${index}`}
                  onClick={() => openEvent(event)}
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
                    <span className="past-event-time">
                      {event.time || "12:00 - 23:59"}
                    </span>
                    <h3
                      id={`past-event-title-${index}`}
                      className="past-event-title"
                    >
                      {event.title}
                    </h3>
                    <span className="past-event-location">{event.location}</span>
                    {event.description && (
                      <p className="past-event-description-preview">
                        {event.description}
                      </p>
                    )}
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
            })}
          </div>
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
