import PropTypes from "prop-types";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import PastEventDetail from "./PastEventDetail.jsx";

function PastEventModal({ event, onClose }) {
  useEffect(() => {
    const handleEscape = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    // The scrollbar's room stays, so the page behind does not widen and shift when it hides.
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("lenis-stopped");

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.scrollbarGutter = "";
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [onClose]);

  // On <body>: inside the page, a hidden or transformed fade-in section would hide or misplace it.
  return createPortal(
    <div className="past-event-modal-overlay" onClick={onClose}>
      <PastEventDetail event={event} onClose={onClose} />
    </div>,
    document.body,
  );
}

PastEventModal.propTypes = {
  event: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PastEventModal;
