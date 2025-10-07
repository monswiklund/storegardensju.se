import { useState } from "react";
import "./PastEvents.css";

function PastEvents() {
  const pastEvents = [
    {
      title: "Västra Kållands Kulturrunda",
      date: "29 Maj 2024",
      time: "10:00 - 17:00",
      description: "Kom och häng på Storegården 7, ta en kaffe i solen, gå in i Ann's ateljé med konst över hela väggarna, fynda på loppisen och ta ett djupt andetag på denna drömmiga plats!",
      location: "Storegården 7, Rackeby"
    },
    {
      title: "Helgkurs Keramik",
      date: "22-23 November 2024",
      time: "17:00 - 21:00\n10:00 - 16:00",
      description: "Både för nybörjare och dig som provat tidigare. Tillkommer ett glaseringstillfälle.",
      location: "Skaparverkstaden, Rörstrand, Lidköping"
    },
    {
      title: "Helgkurs Keramik",
      date: "7-8 November 2024",
      time: "17:00-21:00\n10:00-16:00",
      description: "Både för nybörjare och dig som provat tidigare. Tillkommer ett glaseringstillfälle.",
      location: "Skaparverkstaden, Rörstrand, Lidköping"
    }
  ];

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
              {pastEvents.map((event, idx) => (
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