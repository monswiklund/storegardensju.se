import PropTypes from "prop-types";
import { CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react";

const splitDate = (date) => {
  const parts = (date || "").split(" ");
  return {
    day: parts[0] || "",
    month: parts[1] || "",
    year: parts[2] || "",
  };
};

function EventCard({ event }) {
  const {
    title,
    spots,
    date,
    time,
    description,
    artists,
    location,
    link,
    linkLabel,
    links,
    image,
  } = event;

  // Support both single link (legacy) and multiple links
  const eventLinks =
    links || (link ? [{ href: link, label: linkLabel ?? "Läs mer" }] : []);
  const dateParts = splitDate(date);

  return (
    <article
      className={`event-card ${
        eventLinks.length > 0 ? "konstafton-card" : ""
      } ${image?.src ? "event-card--has-image" : ""}`}
    >
      <header className="event-card__header">
        <div className="event-card__date-card" aria-label={date}>
          <span className="event-card__date-day">{dateParts.day}</span>
          <span className="event-card__date-month">{dateParts.month}</span>
          {dateParts.year && (
            <span className="event-card__date-year">{dateParts.year}</span>
          )}
        </div>
        <div className="event-card__headline">
          <div className="event-card__title-row">
            <h3 className="event-card__title">{title}</h3>
            {spots && <span className="event-card__badge">{spots}</span>}
          </div>
          <div className="event-card__meta">
            {location && (
              <span className="event-card__meta-item">
                <MapPin size={15} aria-hidden="true" />
                {location}
              </span>
            )}
            {time && (
              <span className="event-card__meta-item">
                <Clock size={15} aria-hidden="true" />
                {time}
              </span>
            )}
            {!time && date && (
              <span className="event-card__meta-item">
                <CalendarDays size={15} aria-hidden="true" />
                {date}
              </span>
            )}
          </div>
          {date && <span className="event-card__full-date">{date}</span>}
        </div>
      </header>

      <div className="event-card__layout">
        {image?.src && (
          <div className="event-card__image-container">
            <img
              className="event-card__image"
              src={image.src}
              alt={image.alt ?? ""}
              loading="lazy"
            />
          </div>
        )}

        <div className="event-card__content">
          <div className="event-card__body">
            {description && (
              <p className="event-card__description">{description}</p>
            )}

            {artists && (
              <div className="event-card__artists">
                <strong>Gäster:</strong> {artists}
              </div>
            )}
          </div>

          {eventLinks.length > 0 && (
            <footer className="event-card__footer">
              <div className="event-card__actions">
                {eventLinks.map((linkItem, index) => {
                  const isMapLink = linkItem.href?.includes("maps.google.com");
                  const isInternal = linkItem.href?.startsWith("/");
                  return (
                    <a
                      key={index}
                      href={linkItem.href}
                      target={isInternal ? undefined : "_blank"}
                      rel={isInternal ? undefined : "noopener noreferrer"}
                      className="event-card__button"
                    >
                      {isMapLink ? (
                        <MapPin size={16} aria-hidden="true" />
                      ) : (
                        <ExternalLink size={16} aria-hidden="true" />
                      )}
                      {linkItem.label ?? "Läs mer"}
                    </a>
                  );
                })}
              </div>
            </footer>
          )}
        </div>
      </div>
    </article>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    spots: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    description: PropTypes.string,
    artists: PropTypes.string,
    location: PropTypes.string,
    link: PropTypes.string,
    linkLabel: PropTypes.string,
    links: PropTypes.arrayOf(
      PropTypes.shape({
        href: PropTypes.string.isRequired,
        label: PropTypes.string,
      })
    ),
    image: PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string,
    }),
  }).isRequired,
};

export default EventCard;
