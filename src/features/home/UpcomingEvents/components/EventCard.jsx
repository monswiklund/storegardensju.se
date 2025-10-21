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
    image,
  } = event;

  return (
    <div
      className={`event-card ${
        link ? "konstafton-card" : ""
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
      {link && (
        <div className="event-actions">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="event-link-btn"
          >
            {linkLabel ?? "Läs mer"}
          </a>
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
    image: PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string,
    }),
  }).isRequired,
};

export default EventCard;
