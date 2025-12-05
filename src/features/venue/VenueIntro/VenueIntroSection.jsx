import { venueIntro } from "../../../data/homeContent.js";
import "./VenueIntro.css";

function VenueIntroSection() {
  const { title, description, highlights } = venueIntro;

  return (
    <div className="venue-intro">
      <div className="venue-intro__copy">
        <h2 id="venue-intro-heading">{title}</h2>
        <p>{description}</p>
      </div>
      <ul
        className="venue-intro__highlights"
        aria-label="Vad som gör platsen unik"
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
