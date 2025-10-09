import PropTypes from "prop-types";

function EventCard({ event }) {
  return (
    <div className={`event-card ${event.link ? "konstafton-card" : ""}`}>
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        <span className="event-spots">{event.spots}</span>
      </div>
      <div className="event-meta">
        <span className="event-date">{event.date}</span>
        <span className="event-time">{event.time}</span>
      </div>
      <p className="event-description">{event.description}</p>
      {event.artists && (
        <p className="event-artists">
          <strong>Konstnärer:</strong> {event.artists}
        </p>
      )}
      {event.location && (
        <p className="event-location">{event.location}</p>
      )}
      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className="event-link-btn"
        >
          {event.linkLabel ?? "Läs mer"}
        </a>
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
  }).isRequired,
};

export default EventCard;
