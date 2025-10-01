import "./KommandeEvenemangStyles.css";

function KommandeEvenemang() {
  const events = [
    {
      title: "Konstafton 2025",
      date: "1 November 2025",
      time: "12:00 - 24:00",
      description: "En plats för kreativitet och nöje. Vi öppnar upp dörrarna till ateljén, keramikbutiken och vår eventlokal med utställning på loftet. Vi bjuder in alla för inspiration, skapande och en upplevelse kring gården.",
      artists: "Ann - Keramik & Måleri, Lina - Digital design & Måleri",
      spots: "Fri entré",
      link: "https://konstafton.se/",
      location: "Storegården 7, Rackeby"
    }
  ];

  return (
    <section id="evenemang-section" className="evenemang-section" aria-labelledby="evenemang-heading">
      <div className="evenemang-container">
        <h2 id="evenemang-heading">Kommande evenemang</h2>
        <p className="evenemang-intro">
          Upptäck våra kommande workshops, kurser och evenemang. Boka din plats redan idag!
        </p>

        <div className="events-grid">
          {events.map((event, index) => (
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
                  Läs mer på konstafton.se
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
            <h3>Begränsat antal platser</h3>
            <p>Vi har begränsat antal evenemang och kurstillfällen vi kan genomföra varje år. Ser du inget som passar? Kontakta oss för att anmäla ditt intresse eller boka privata kurser och gruppbokningar.</p>
            <button
              className="info-cta-button"
              onClick={() => document.querySelector('.kontakt-container')?.scrollIntoView({behavior: 'smooth', block: 'center'})}
            >
              Kontakta oss
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default KommandeEvenemang;
