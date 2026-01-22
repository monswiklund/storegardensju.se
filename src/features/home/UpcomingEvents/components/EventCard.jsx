import PropTypes from "prop-types";

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

  // Map icon SVG component
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
    <article
      className={`event-card ${
        eventLinks.length > 0 ? "konstafton-card" : ""
      } ${image?.src ? "event-card--has-image" : ""}`}
    >
      {/* 1. Header: Title, Date, Time, Location */}
      <header className="event-card__header">
        <div className="event-card__title-row">
          <h3 className="event-card__title">{title}</h3>
          {spots && <span className="event-card__badge">{spots}</span>}
        </div>

        <div className="event-card__meta">
          {location && (
            <span className="event-card__location-text">{location}</span>
          )}
          {(date || time) && location && (
            <span className="event-card__separator">•</span>
          )}
          <span className="event-card__date">{date}</span>
          {time && <span className="event-card__separator">•</span>}
          <span className="event-card__time">{time}</span>
        </div>
      </header>

      {/* 2. Image */}
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

      {/* 3. Body: Description, Artists, Actions */}
      <div className="event-card__content">
        <div className="event-card__body">
          <p className="event-card__description">{description}</p>

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
                return (
                  <a
                    key={index}
                    href={linkItem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-card__button"
                  >
                    {isMapLink && <MapIcon />}
                    {linkItem.label ?? "Läs mer"}
                  </a>
                );
              })}
            </div>
          </footer>
        )}
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
