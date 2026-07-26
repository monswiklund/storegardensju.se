import PropTypes from "prop-types";
import { Info } from "lucide-react";

function InfoCallout({ onContact = undefined }) {
  return (
    <aside className="info-box" aria-label="Information om evenemang">
      <Info className="info-icon" size={20} aria-hidden="true" />
      <div className="info-content">
        <p>
          Vi har begränsat antal evenemang och kurstillfällen vi kan genomföra
          varje år. Ser du inget som passar kan du anmäla intresse eller fråga
          om privat kurs och gruppbokning.
        </p>
        {onContact && (
          <button className="info-cta-button" onClick={onContact} type="button">
            Hör av dig
          </button>
        )}
      </div>
    </aside>
  );
}

InfoCallout.propTypes = {
  onContact: PropTypes.func,
};

export default InfoCallout;
