import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  X,
  Calendar
} from "lucide-react";
import "../../PastEvents/PastEvents.css";

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
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentImageIndex] || images[0] : null;
  const showControls = images.length > 1;
  const selectedEventLinks =
    selectedEvent?.links ||
    (selectedEvent?.link
      ? [
          {
            href: selectedEvent.link,
            label: selectedEvent.linkLabel || "Läs mer",
          },
        ]
      : []);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
          <h2 className="past-events-heading">Det som redan har hänt</h2>
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
                  key={`${event.title}-${index}`}
                  className={`past-event-item ${
                    thumbImage?.src ? "" : "past-event-item--no-image"
                  }`}
                  aria-labelledby={`past-event-title-${index}`}
                  onClick={() => setSelectedEvent(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedEvent(event);
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
        <div
          className="past-event-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className={`past-event-modal-content ${
              hasImages
                ? "past-event-modal-content--with-image"
                : "past-event-modal-content--text-only"
            }`}
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

            {hasImages && (
              <div
                className="past-event-modal-image"
                style={{ "--past-event-modal-bg": `url("${currentImage.src}")` }}
              >
                <img
                  src={currentImage.src}
                  alt={currentImage.alt || ""}
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
                    <div className="carousel-dots" aria-label="Bildval">
                      {images.map((_, idx) => (
                        <button
                          type="button"
                          key={idx}
                          className={`carousel-dot ${
                            idx === currentImageIndex ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                          aria-label={`Visa bild ${idx + 1}`}
                          aria-current={idx === currentImageIndex}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="past-event-modal-body">
              <div className="past-event-modal-meta-grid">
                <div className="past-event-modal-date-card">
                  <span>Datum</span>
                  <strong>{selectedEvent.date}</strong>
                </div>
                <div className="past-event-modal-facts">
                  {selectedEvent.time && (
                    <span className="past-event-modal-fact">
                      <strong>Tid</strong>
                      {selectedEvent.time}
                    </span>
                  )}
                  {selectedEvent.location && (
                    <span className="past-event-modal-fact">
                      <strong>Plats</strong>
                      {selectedEvent.location}
                    </span>
                  )}
                </div>
              </div>

              <h2 id="modal-title" className="past-event-modal-title">
                {selectedEvent.title}
              </h2>

              {selectedEvent.moments?.length > 0 ? (
                <div className="past-event-modal-moments">
                  <span>Dagen</span>
                  <ol>
                    {selectedEvent.moments.map((moment) => (
                      <li
                        key={`${moment.time}-${moment.title}`}
                        className={`past-event-modal-moment past-event-modal-moment--${
                          moment.tone || "yoga"
                        }`}
                      >
                        <span className="past-event-modal-moment-time">
                          {moment.time}
                        </span>
                        <strong>{moment.title}</strong>
                        {moment.description && <p>{moment.description}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : selectedEvent.description ? (
                <p className="past-event-modal-description">
                  {selectedEvent.description}
                </p>
              ) : null}

              {selectedEvent.artists && (
                <p className="past-event-modal-artists">
                  <strong>Konstnärer:</strong> {selectedEvent.artists}
                </p>
              )}
            </div>

            {selectedEventLinks.length > 0 && (
              <div className="past-event-modal-actions">
                {selectedEventLinks.map((linkItem, index) => {
                  const isMapLink = linkItem.href?.includes("maps.google.com");

                  return (
                    <a
                      key={index}
                      href={linkItem.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="past-event-modal-button"
                    >
                      {isMapLink ? (
                        <MapPin size={16} aria-hidden="true" />
                      ) : (
                        <ExternalLink size={16} aria-hidden="true" />
                      )}
                      {linkItem.label}{" "}
                      {!isMapLink && !linkItem.label?.includes("→") && "→"}
                    </a>
                  );
                })}
              </div>
            )}
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
