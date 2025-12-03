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
  const eventLinks = links || (link ? [{ href: link, label: linkLabel ?? "Läs mer" }] : []);

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
    <div
      className={`event-card ${
        eventLinks.length > 0 ? "konstafton-card" : ""
      } ${image?.src ? "event-card--with-image" : ""}`}
    >
      <div className="event-content">
        <div className="event-header">
          <h3 className="event-title">{title}</h3>
          <span className="event-spots">{spots}</span>
        </div>
        <div className="event-meta">
          <span className="event-date">{date}</span>
          <span className="event-time">{time}</span>
        </div>
        <p className="event-description">{description}</p>
        {artists && (
          <p className="event-artists">
            <strong>Konstnärer:</strong> {artists}
          </p>
        )}
        {location && <p className="event-location">{location}</p>}
      </div>
      {image?.src && (
        <figure className="event-image-wrapper">
          <img
            className="event-image"
            src={image.src}
            alt={image.alt ?? ""}
            loading="lazy"
          />
        </figure>
      )}
      {eventLinks.length > 0 && (
        <div className="event-actions">
          {eventLinks.map((linkItem, index) => {
            const isMapLink = linkItem.href?.includes("maps.google.com");
            return (
              <a
                key={index}
                href={linkItem.href}
                target="_blank"
                rel="noopener noreferrer"
                className="event-link-btn"
              >
                {isMapLink && <MapIcon />}
                {linkItem.label ?? "Läs mer"}
              </a>
            );
          })}
        </div>
      )}
    </div>
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
