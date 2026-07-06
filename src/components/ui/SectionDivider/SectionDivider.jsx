import PropTypes from "prop-types";
import "./SectionDivider.css";

/**
 * SectionDivider - A reusable component for elegant transitions between page sections.
 * Creates organic wave/curve color boundaries.
 *
 * @param {string} above - Background color of the section above ("white", "alt", "green")
 * @param {string} below - Background color of the section below ("white", "alt", "green")
 * @param {string} variant - Type of divider ("wave", "valley", "hill", "curve-down", "curve-up", "flat")
 */
function SectionDivider({
  above = "white",
  below = "alt",
  variant = "wave",
}) {
  const containerClasses = `section-divider variant-${variant} above-${above} below-${below}`;

  if (variant === "flat") {
    // If there are no lines, a flat divider between identical background colors is not needed.
    return null;
  }

  // Define SVG paths for the filled shape of each variant
  let pathD = "";

  switch (variant) {
    case "wave":
      // An organic S-wave curving down then up
      pathD = "M0,24 C300,42 450,6 600,24 C750,42 900,6 1200,24 L1200,48 L0,48 Z";
      break;
    case "valley":
    case "curve-down":
      // A soft, flat-bottomed valley dipping in the middle
      pathD = "M0,4 C300,36 900,36 1200,4 L1200,48 L0,48 Z";
      break;
    case "hill":
    case "curve-up":
      // A soft, flat-topped hill arching up in the middle
      pathD = "M0,44 C300,12 900,12 1200,44 L1200,48 L0,48 Z";
      break;
    default:
      // Fallback to simple valley
      pathD = "M0,0 Q600,36 1200,0 L1200,48 L0,48 Z";
  }

  return (
    <div className={containerClasses} role="separator" aria-hidden="true">
      <svg
        viewBox="0 0 1200 48"
        className="section-divider-svg"
        preserveAspectRatio="none"
      >
        {/* Filled shape matching the below section's color */}
        <path d={pathD} className="section-divider-svg-path" />
      </svg>
    </div>
  );
}

SectionDivider.propTypes = {
  above: PropTypes.oneOf(["white", "alt", "green"]),
  below: PropTypes.oneOf(["white", "alt", "green"]),
  variant: PropTypes.oneOf(["wave", "valley", "hill", "curve-down", "curve-up", "flat"]),
};

export default SectionDivider;
