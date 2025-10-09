import PropTypes from "prop-types";

function PastEventsAccordion({ isOpen, onToggle, events }) {
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
        <div className="past-events-grid" style={{ marginTop: "28px" }}>
          {events.map((event, index) => (
            <article
              key={`${event.title}-${index}`}
              className="past-event-card"
              aria-labelledby={`past-event-title-${index}`}
            >
              <h3
                id={`past-event-title-${index}`}
                className="past-event-title"
              >
                {event.title}
              </h3>
              <div className="past-event-meta">
                <span className="past-event-date">{event.date}</span>
                <span
                  className="past-event-time"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {event.time}
                </span>
              </div>
              <p className="past-event-description">{event.description}</p>
              {event.location && (
                <p className="past-event-location">{event.location}</p>
              )}
            </article>
          ))}
        </div>
      </div>
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
    }),
  ).isRequired,
};

export default PastEventsAccordion;
