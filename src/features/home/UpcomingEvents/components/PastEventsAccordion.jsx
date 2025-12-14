import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

function PastEventsAccordion({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedEvent(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Reset image index when event changes
  useEffect(() => {
    if (selectedEvent) {
      setCurrentImageIndex(0);
    }
  }, [selectedEvent]);

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

  // Helper to get all images for the selected event
  const getEventImages = (event) => {
    if (!event) return [];
    if (event.images && event.images.length > 0) return event.images;
    if (event.image?.src) return [event.image];
    return [];
  };

  const images = getEventImages(selectedEvent);
  const showControls = images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const visibleEvents = showAll ? events : events.slice(0, 5);

  return (
    <div className="past-events-section" data-section="past-events">
      <div className="past-events-header">
        <h2 className="past-events-heading">Tidigare evenemang</h2>
      </div>

      <div className="past-events-list">
        {visibleEvents.map((event, index) => {
          // Basic date parsing (assuming format "1 November 2025" or similar)
          // We'll just split by space for a simple "Day Month" badge
          const dateParts = event.date.split(" ");
          const day = dateParts[0] || "";
          const month = dateParts[1]
            ? dateParts[1].substring(0, 3).toUpperCase()
            : "";

          // Use the first available image as thumbnail
          const thumbImage = event.images?.[0] || event.image;

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

              {thumbImage?.src && (
                <div className="past-event-thumbnail">
                  <img
                    src={thumbImage.src}
                    alt={thumbImage.alt || ""}
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
                  <span className="past-event-location">{event.location}</span>
                )}
                {event.description && (
                  <p className="past-event-description-preview">
                    {event.description}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {events.length > 5 && (
        <div className="past-events-footer">
          <button
            className="past-events-show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Visa färre" : "Visa fler evenemang"}
          </button>
        </div>
      )}

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

            {images.length > 0 && (
              <div className="past-event-modal-image">
                <img
                  src={images[currentImageIndex].src}
                  alt={images[currentImageIndex].alt || ""}
                />

                {showControls && (
                  <>
                    <button
                      className="carousel-nav prev"
                      onClick={prevImage}
                      aria-label="Föregående bild"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className="carousel-nav next"
                      onClick={nextImage}
                      aria-label="Nästa bild"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="carousel-dots">
                      {images.map((_, idx) => (
                        <span
                          key={idx}
                          className={`carousel-dot ${
                            idx === currentImageIndex ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="past-event-modal-body">
              <span className="past-event-modal-date">
                {selectedEvent.date}
              </span>

              {selectedEvent.time && (
                <span className="past-event-modal-time">
                  {selectedEvent.time}
                </span>
              )}

              <h2 id="modal-title" className="past-event-modal-title">
                {selectedEvent.title}
              </h2>

              {selectedEvent.description && (
                <p className="past-event-modal-description">
                  {selectedEvent.description}
                </p>
              )}

              {selectedEvent.artists && (
                <p className="past-event-modal-artists">
                  <strong>Konstnärer:</strong> {selectedEvent.artists}
                </p>
              )}

              {selectedEvent.location && (
                <div className="past-event-modal-meta">
                  <span className="meta-location">
                    {selectedEvent.location}
                  </span>
                </div>
              )}
            </div>

            {/* Actions / Links - Moved outside body for Grid placement */}
            <div className="past-event-modal-actions">
              {(
                selectedEvent.links ||
                (selectedEvent.link
                  ? [
                      {
                        href: selectedEvent.link,
                        label: selectedEvent.linkLabel || "Läs mer",
                      },
                    ]
                  : [])
              ).map((linkItem, index) => {
                const isMapLink = linkItem.href?.includes("maps.google.com");

                // Map Icon SVG
                const MapIcon = () => (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: "6px" }}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                );

                return (
                  <a
                    key={index}
                    href={linkItem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="past-event-modal-button"
                  >
                    {isMapLink && <MapIcon />}
                    {linkItem.label}{" "}
                    {!isMapLink && !linkItem.label?.includes("→") && "→"}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

PastEventsAccordion.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string,
      description: PropTypes.string,
      location: PropTypes.string,
    })
  ).isRequired,
};

export default PastEventsAccordion;
