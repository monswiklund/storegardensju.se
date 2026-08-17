import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react";
import { canonicalPath } from "../../../../config/routes.js";
import { useSiteCopy } from "../../../../hooks/usePageCopy.js";
import "../../PastEvents/PastEvents.css";

export const PAST_EVENT_VARIANT_MODAL = "modal";
export const PAST_EVENT_VARIANT_PREVIEW = "preview";

const MAPS_HOST = "maps.google.com";

const getEventImages = (event) => {
  if (!event) return [];
  if (event.images?.length > 0) return event.images.filter((image) => image?.src);
  if (event.image?.src) return [event.image];
  return [];
};

/**
 * The public event detail card. Shared by the storefront modal and the admin
 * live preview so both render from the same source of truth.
 */
function PastEventDetail({
  event,
  variant = PAST_EVENT_VARIANT_MODAL,
  onClose,
  titleId = "modal-title",
}) {
  const siteCopy = useSiteCopy();
  const [imageIndex, setImageIndex] = useState(0);

  const images = getEventImages(event);
  const hasImages = images.length > 0;
  const showControls = images.length > 1;
  // Clamped rather than reset, so removing an image in the admin form does not
  // leave the carousel pointing past the end.
  const safeIndex = hasImages ? Math.min(imageIndex, images.length - 1) : 0;
  const currentImage = hasImages ? images[safeIndex] : null;
  const defaultLinkLabel = siteCopy("ui.read-more");
  const links = event?.links?.length > 0
    ? event.links.filter((link) => link?.href)
    : event?.link
      ? [{ href: event.link, label: event.linkLabel || defaultLinkLabel }]
      : [];

  useEffect(() => {
    setImageIndex(0);
  }, [event?.title, event?.date]);

  const step = (delta) => (clickEvent) => {
    clickEvent.stopPropagation();
    setImageIndex((prev) => (prev + delta + images.length) % images.length);
  };

  const classes = [
    "past-event-modal-content",
    hasImages
      ? "past-event-modal-content--with-image"
      : "past-event-modal-content--text-only",
    variant === PAST_EVENT_VARIANT_PREVIEW
      ? "past-event-modal-content--preview"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      onClick={(clickEvent) => clickEvent.stopPropagation()}
      role={variant === PAST_EVENT_VARIANT_MODAL ? "dialog" : "group"}
      aria-modal={variant === PAST_EVENT_VARIANT_MODAL ? "true" : undefined}
      aria-labelledby={titleId}
      data-lenis-prevent
    >
      {onClose && (
        <button
          type="button"
          className="past-event-modal-close"
          onClick={onClose}
          aria-label={siteCopy("ui.close")}
        >
          <X size={24} />
        </button>
      )}

      {hasImages && (
        <div
          className="past-event-modal-image"
          style={{ "--past-event-modal-bg": `url("${currentImage.src}")` }}
        >
          <img src={currentImage.src} alt={currentImage.alt || ""} />

          {showControls && (
            <>
              <button
                type="button"
                className="carousel-nav prev"
                onClick={step(-1)}
                aria-label={siteCopy("ui.previous-image")}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="carousel-nav next"
                onClick={step(1)}
                aria-label={siteCopy("ui.next-image")}
              >
                <ChevronRight size={24} />
              </button>
              <div className="carousel-dots">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.src || index}
                    className={`carousel-dot ${index === safeIndex ? "active" : ""}`}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      setImageIndex(index);
                    }}
                    aria-current={index === safeIndex}
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
            <span>{siteCopy("ui.date-label")}</span>
            <strong>{event.date}</strong>
          </div>
          <div className="past-event-modal-facts">
            {event.time && (
              <span className="past-event-modal-fact">
                <strong>{siteCopy("ui.time-label")}</strong>
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="past-event-modal-fact">
                <strong>{siteCopy("ui.location-label")}</strong>
                {event.location}
              </span>
            )}
          </div>
        </div>

        {event.spots && (
          <span className="past-event-modal-badge">{event.spots}</span>
        )}

        <h2 id={titleId} className="past-event-modal-title">
          {event.title}
        </h2>

        {event.moments?.length > 0 ? (
          <div className="past-event-modal-moments">
            <span>{siteCopy("ui.day-label")}</span>
            <ol>
              {event.moments.map((moment) => (
                <li
                  key={`${moment.time}-${moment.title}`}
                  className={`past-event-modal-moment past-event-modal-moment--${
                    moment.tone || "yoga"
                  }`}
                >
                  <span className="past-event-modal-moment-time">{moment.time}</span>
                  <strong>{moment.title}</strong>
                  {moment.description && <p>{moment.description}</p>}
                </li>
              ))}
            </ol>
          </div>
        ) : event.description ? (
          <p className="past-event-modal-description">{event.description}</p>
        ) : null}

        {event.sessions?.length > 0 && (
          <div className="past-event-modal-sessions">
            <span className="past-event-modal-sessions-heading">
              Genomförda tillfällen ({event.sessions.length} st)
            </span>
            <ul className="past-event-modal-sessions-list">
              {event.sessions.map((session, idx) => (
                <li key={session.id || idx} className="past-event-modal-session-item">
                  <span className="session-date">{session.date}</span>
                  {session.time && <span className="session-time">{session.time}</span>}
                  <span className="session-title">{session.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.artists && (
          <p className="past-event-modal-artists">
            <strong>{siteCopy("ui.artists-label") || "Konstnärer"}:</strong> {event.artists}
          </p>
        )}

        {links.length > 0 && (
          <div className="past-event-modal-actions">
            {links.map((link, index) => {
              const isMapLink = link.href?.includes(MAPS_HOST);
              const isInternalLink = link.href?.startsWith("/");

              if (isInternalLink) {
                return (
                  <Link
                    key={link.href || index}
                    to={canonicalPath(link.href)}
                    className="past-event-modal-button"
                  >
                    <ArrowUpRight size={16} aria-hidden="true" />
                    {link.label || defaultLinkLabel}
                  </Link>
                );
              }

              return (
                <a
                  key={link.href || index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="past-event-modal-button"
                >
                  {isMapLink ? (
                    <MapPin size={16} aria-hidden="true" />
                  ) : (
                    <ExternalLink size={16} aria-hidden="true" />
                  )}
                  {link.label || defaultLinkLabel}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const imageShape = PropTypes.shape({
  src: PropTypes.string,
  alt: PropTypes.string,
});

const linkShape = PropTypes.shape({
  href: PropTypes.string,
  label: PropTypes.string,
});

PastEventDetail.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string,
    spots: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string,
    artists: PropTypes.string,
    link: PropTypes.string,
    linkLabel: PropTypes.string,
    links: PropTypes.arrayOf(linkShape),
    image: imageShape,
    images: PropTypes.arrayOf(imageShape),
    moments: PropTypes.arrayOf(
      PropTypes.shape({
        time: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        tone: PropTypes.oneOf(["yoga", "creative"]),
      })
    ),
  }).isRequired,
  variant: PropTypes.oneOf([
    PAST_EVENT_VARIANT_MODAL,
    PAST_EVENT_VARIANT_PREVIEW,
  ]),
  onClose: PropTypes.func,
  titleId: PropTypes.string,
};

export default PastEventDetail;
