import { useState } from 'react';
import "./UpcomingEvents.css";
import "../PastEvents/PastEvents.css"; // reuse collapsible styles
import { upcomingEvents, pastEvents as pastEventsData } from "../../../data/homeContent.js";

function UpcomingEvents() {
  const [showPast, setShowPast] = useState(false);

  return (
    <div id="events-section" className="events-section">
      <div className="events-container">
        <h2 id="events-heading">Kommande evenemang</h2>
        <p className="events-intro">
          Upptäck våra kommande workshops, kurser och evenemang. Boka din plats redan idag!
        </p>

        <div className="events-grid">
          {upcomingEvents.map((event, index) => (
            <div key={index} className={`event-card ${event.link ? 'konstafton-card' : ''}`}>
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
                  {event.linkLabel ?? 'Läs mer'}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="info-box">
          <div className="info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div className="info-content">
            <p>Vi har begränsat antal evenemang och kurstillfällen vi kan genomföra varje år. Ser du inget som passar? Kontakta oss gärna för att anmäla ditt intresse eller boka privata kurser och gruppbokningar.</p>
            <button
              className="info-cta-button"
              onClick={() => document.querySelector('.contact-container')?.scrollIntoView({behavior: 'smooth', block: 'center'})}
            >
              Kontakta oss
            </button>
          </div>
        </div>

        {/* Past events collapsible */}
        <div className="past-events-collapsible" data-section="past-events">
          <button
            type="button"
            className="collapsible-toggle"
            aria-expanded={showPast}
            aria-controls="past-events-content"
            onClick={() => setShowPast(v => !v)}
          >
            <span className="collapsible-title">Tidigare evenemang</span>
            <span className={`chevron ${showPast ? 'open' : ''}`} aria-hidden>▾</span>
          </button>
          <div
            id="past-events-content"
            className={`collapsible-content ${showPast ? 'open' : ''}`}
            role="region"
            aria-label="Tidigare evenemang"
          >
            <div className="past-events-grid" style={{marginTop: '28px'}}>
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
          </div>
        </div>

      </div>
    </div>
  );
}

export default UpcomingEvents;
