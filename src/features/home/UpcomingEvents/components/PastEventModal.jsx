import PropTypes from "prop-types";
import { useEffect } from "react";
import PastEventDetail from "./PastEventDetail.jsx";

function PastEventModal({ event, onClose }) {
  useEffect(() => {
    const handleEscape = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("lenis-stopped");

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [onClose]);

  return (
    <div className="past-event-modal-overlay" onClick={onClose}>
      <PastEventDetail event={event} onClose={onClose} />
    </div>
  );
}

PastEventModal.propTypes = {
  event: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PastEventModal;
