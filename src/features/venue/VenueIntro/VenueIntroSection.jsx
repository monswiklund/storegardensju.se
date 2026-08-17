import usePageCopy from "../../../hooks/usePageCopy.js";
import usePageLists from "../../../hooks/usePageLists.js";
import "./VenueIntro.css";

function VenueIntroSection() {
  const copy = usePageCopy("home");
  const list = usePageLists("home");
  const highlights = list("venue-highlights", []).map((item) => item.body || item.title).filter(Boolean);

  return (
    <div className="venue-intro">
      <div className="venue-intro__copy">
        <h2 id="venue-intro-heading">{copy("venue.title")}</h2>
        <p>{copy("venue.description")}</p>
      </div>
      <ul
        className="venue-intro__highlights"
      >
        {highlights.map((highlight, index) => (
          <li key={index} className="venue-intro__highlight">
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
