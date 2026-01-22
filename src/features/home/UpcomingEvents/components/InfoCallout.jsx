import PropTypes from "prop-types";
import { useState } from "react";
import { Info, X } from "lucide-react";

function InfoCallout({ onContact }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="info-toggle-container">
        <button
          className="info-toggle-button"
          onClick={() => setIsOpen(true)}
          aria-label="Visa information"
        >
          <Info size={24} />
          <span className="info-toggle-label">Info angående evenemang</span>
        </button>
      </div>
    );
  }

  return (
    <div className="info-box open">
      <button
        className="info-close-button"
        onClick={() => setIsOpen(false)}
        aria-label="Stäng information"
      >
        <X size={20} />
      </button>

      <div className="info-icon">
        <Info size={24} />
      </div>
      <div className="info-content">
        <p>
          Vi har begränsat antal evenemang och kurstillfällen vi kan genomföra
          varje år. Ser du inget som passar? <br></br>Kontakta oss gärna för att
          anmäla ditt intresse eller boka privata kurser och gruppbokningar.
        </p>
        <button className="info-cta-button" onClick={onContact} type="button">
          Kontakta oss
        </button>
      </div>
    </div>
  );
}

InfoCallout.propTypes = {
  onContact: PropTypes.func,
};

InfoCallout.defaultProps = {
  onContact: undefined,
};

export default InfoCallout;
