import "./EventPartyStyles.css";

function EventParty() {
  return (
    <div id="event-party-section" className="event-party-section">
      <div className="event-party-container">
        <h2 id="event-party-heading">Event & Fest</h2>

        <div className="event-party-content">
          <div className="event-party-intro">
{/*            <h3>Skapa minnen som varar</h3>
            <p>
              Oavsett om du
              planerar en företagsfest, födelsedagskalas, vernissage eller privat tillställning,
              erbjuder vi en flexibel och välkomnande miljö.
            </p>
            <p>
              Vår lokal rymmer 10-140 gäster beroende på typ av arrangemang och kan anpassas
              efter dina önskemål. Vi hjälper dig att skapa det perfekta evenemanget.
            </p>
         */}
          </div>

          {/*<div className="offerings-grid">
            <h4>Vad vi erbjuder:</h4>
            <ul className="offerings-list">
              {offerings.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>*/}
        </div>

        <div className="event-types">
          <h4>Perfekt för:</h4>
          <div className="types-grid">
            <div className="type-item">Bröllop</div>
            <div className="type-item">Företagsevent</div>
            <div className="type-item">Födelsedagsfester</div>
            <div className="type-item">Vernissage</div>
            <div className="type-item">Workshops</div>
          </div>
        </div>

        <div className="event-party-cta">
          <h3>Intresserad av att boka lokalen?</h3>
          <button
            className="contact-button"
            onClick={() => document.querySelector('.contact-container')?.scrollIntoView({behavior: 'smooth', block: 'center'})}
          >
            Kontakta oss
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventParty;