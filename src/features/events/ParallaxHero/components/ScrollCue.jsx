import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import { useSiteCopy } from "../../../../hooks/usePageCopy.js";

function ScrollCue({ onClick = undefined }) {
  const siteCopy = useSiteCopy();
  return (
    <button
      className="scroll-indicator"
      onClick={onClick}
      aria-label={siteCopy("ui.scroll-down")}
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
