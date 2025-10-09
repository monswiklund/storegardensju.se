import "./EventParty.css";
import eventTypesData from "./eventPartyHighlights.js";

function EventPartyHighlights() {
  return (
    <div id="event-party-section" className="event-party-section">
      <div className="event-party-container">
        <h2 id="event-party-heading">Event & Fest</h2>
        <div className="event-party-content"></div>
<div className="event-types">
    <h4>Perfekt för:</h4>
    <div className="types-grid">
        {eventTypesData.map((type, index) => (
            <div key={index} className="type-item">
            <p className="type-name">{type.name}</p>
            </div>
        ))}
    </div>
</div>
        <div className="event-party-cta">
          <h3>Intresserad av att boka lokalen?</h3>
            <button
                className="contact-button"
                onClick={() =>
                    document
                        .querySelector(".contact-container")
                        ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
            >
                Kontakta oss
            </button>
        </div>
      </div>
    </div>
  );
}

export default EventPartyHighlights;
