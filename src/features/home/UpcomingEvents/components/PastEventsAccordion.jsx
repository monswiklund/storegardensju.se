import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

function PastEventsAccordion({ isOpen, onToggle, events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedEvent(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.classList.add("lenis-stopped"); // Stop Lenis
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [selectedEvent]);

  return (
    <div className="past-events-collapsible" data-section="past-events">
      <button
        type="button"
        className="collapsible-toggle"
        aria-expanded={isOpen}
        aria-controls="past-events-content"
        onClick={onToggle}
      >
        <span className="collapsible-title">Tidigare evenemang</span>
        <span className={`chevron ${isOpen ? "open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      <div
        id="past-events-content"
        className={`collapsible-content ${isOpen ? "open" : ""}`}
        role="region"
        aria-label="Tidigare evenemang"
      >
        <div className="past-events-list" style={{ marginTop: "28px" }}>
          {events.map((event, index) => {
            // Basic date parsing (assuming format "1 November 2025" or similar)
            // We'll just split by space for a simple "Day Month" badge
            const dateParts = event.date.split(" ");
            const day = dateParts[0] || "";
            const month = dateParts[1]
              ? dateParts[1].substring(0, 3).toUpperCase()
              : "";

            return (
              <article
                key={`${event.title}-${index}`}
                className="past-event-item"
                aria-labelledby={`past-event-title-${index}`}
                onClick={() => setSelectedEvent(event)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedEvent(event);
                  }
                }}
              >
                <div className="past-event-date-badge">
                  <span className="date-day">{day}</span>
                  <span className="date-month">{month}</span>
                </div>

                {event.image?.src && (
                  <div className="past-event-thumbnail">
                    <img
                      src={event.image.src}
                      alt={event.image.alt || ""}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="past-event-info">
                  <h3
                    id={`past-event-title-${index}`}
                    className="past-event-title"
                  >
                    {event.title}
                  </h3>
                  {event.location && (
                    <span className="past-event-location">
                      {event.location}
                    </span>
                  )}
                </div>

                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="past-event-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    →
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="past-event-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="past-event-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            data-lenis-prevent
          >
            <button
              className="past-event-modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Stäng"
            >
              <X size={24} />
            </button>

            {selectedEvent.image?.src && (
              <div className="past-event-modal-image">
                <img
                  src={selectedEvent.image.src}
                  alt={selectedEvent.image.alt || ""}
                />
              </div>
            )}

            <div className="past-event-modal-body">
              <span className="past-event-modal-date">
                {selectedEvent.date}
              </span>
              <h2 id="modal-title" className="past-event-modal-title">
                {selectedEvent.title}
              </h2>

              {selectedEvent.time && (
                <p className="past-event-modal-meta">
                  {selectedEvent.time} • {selectedEvent.location}
                </p>
              )}

              {selectedEvent.description && (
                <p className="past-event-modal-description">
                  {selectedEvent.description}
                </p>
              )}

              {selectedEvent.artists && (
                <p className="past-event-modal-artists">
                  <strong>Gäster:</strong> {selectedEvent.artists}
                </p>
              )}

              {selectedEvent.link && (
                <a
                  href={selectedEvent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="past-event-modal-link"
                >
                  {selectedEvent.linkLabel || "Läs mer"} →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

PastEventsAccordion.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      location: PropTypes.string,
    })
  ).isRequired,
};

export default PastEventsAccordion;
