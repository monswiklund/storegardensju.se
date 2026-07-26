import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";

function ScrollCue({ onClick = undefined }) {
  return (
    <button
      className="scroll-indicator"
      onClick={onClick}
      aria-label="Scrolla ner"
      type="button"
    >
      <ChevronDown size={32} />
    </button>
  );
}

ScrollCue.propTypes = {
  onClick: PropTypes.func,
};

export default ScrollCue;
