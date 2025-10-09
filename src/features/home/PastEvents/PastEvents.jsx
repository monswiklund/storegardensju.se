import { useState } from "react";
import pastEventsData from "../../../data/PastEventsData.js";
import "./PastEvents.css";


  function PastEvents() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section
      id="past-events-section"
      className={`past-events-section ${isOpen ? 'open' : 'collapsed'}`}
      aria-labelledby="past-events-heading"
    >
      <div className="past-events-container">
        <button
          type="button"
          className="collapsible-toggle"
          aria-expanded={isOpen}
          aria-controls="past-events-collapsible-content"
          onClick={() => setIsOpen(o => !o)}
        >
          <span className="collapsible-title" id="past-events-heading">Tidigare evenemang</span>
          <span className={`chevron ${isOpen ? 'open' : ''}`} aria-hidden>▾</span>
        </button>
        <div className="collapsible-intro-wrapper" aria-hidden={!isOpen}>
            <p className="past-events-intro">Ett urval av våra tidigare workshops, kurser och evenemang.</p>
        </div>
        <div
          id="past-events-collapsible-content"
          className={`collapsible-content ${isOpen ? 'open' : ''}`}
          role="region"
          aria-label="Lista över tidigare evenemang"
        >
          {isOpen && (
            <div className="past-events-grid" data-testid="past-events-grid">
              {pastEventsData.map((event, idx) => (
                <article key={idx} className="past-event-card" aria-labelledby={`past-event-title-${idx}`}>
                  <h3 id={`past-event-title-${idx}`} className="past-event-title">{event.title}</h3>
                  <div className="past-event-meta">
                    <span className="past-event-date">{event.date}</span>
                    <span className="past-event-time" style={{ whiteSpace: 'pre-line' }}>{event.time}</span>
                  </div>
                  <p className="past-event-description">{event.description}</p>
                  {event.location && (
                    <p className="past-event-location">{event.location}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PastEvents;