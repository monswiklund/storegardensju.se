import PropTypes from "prop-types";

function InfoCallout({ onContact }) {
  return (
    <div className="info-box">
      <div className="info-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>
      <div className="info-content">
        <p>
          Vi har begränsat antal evenemang och kurstillfällen vi kan genomföra
          varje år. Ser du inget som passar? Kontakta oss gärna för att anmäla
          ditt intresse eller boka privata kurser och gruppbokningar.
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
