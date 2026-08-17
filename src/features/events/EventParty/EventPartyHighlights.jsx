import usePageCopy, { useSiteCopy } from "../../../hooks/usePageCopy.js";
import "./EventParty.css";
import eventTypesData from "./eventPartyHighlights.js";

function EventPartyHighlights() {
  const copy = usePageCopy("event");
  const siteCopy = useSiteCopy();
  return (
    <div id="event-party-section" className="event-party-section">
      <div className="event-party-container">
        <h2 id="event-party-heading">{copy("intro.title")}</h2>
        <div className="event-party-content"></div>
<div className="event-types">
    <h4>{copy("types.heading")}</h4>
    <div className="types-grid">
        {eventTypesData.map((type, index) => (
            <div key={index} className="type-item">
            <p className="type-name">{type.name}</p>
            </div>
        ))}
    </div>
</div>
        <div className="event-party-cta">
          <h3>{copy("cta.title")}</h3>
            <button
                className="contact-button"
                onClick={() => {
                    window.dispatchEvent(new CustomEvent("expand-contact-form"));
                    document
                        .querySelector(".contact-container")
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
            >
                {siteCopy("nav.contact")}
            </button>
        </div>
      </div>
    </div>
  );
}

export default EventPartyHighlights;
