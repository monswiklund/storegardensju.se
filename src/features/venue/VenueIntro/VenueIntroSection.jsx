import { venueIntro } from "../../../data/homeContent.js";
import usePageCopy from "../../../hooks/usePageCopy.js";
import "./VenueIntro.css";

function VenueIntroSection() {
  const copy = usePageCopy("home");
  const { title, description, highlights } = venueIntro;

  return (
    <div className="venue-intro">
      <div className="venue-intro__copy">
        <h2 id="venue-intro-heading">{copy("venue.title", title)}</h2>
        <p>{copy("venue.description", description)}</p>
      </div>
      <ul
        className="venue-intro__highlights"
        aria-label="Praktisk information om platsen"
      >
        {highlights.map((highlight) => (
          <li key={highlight} className="venue-intro__highlight">
            <span className="venue-intro__icon" aria-hidden="true">
              ✦
            </span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VenueIntroSection;
