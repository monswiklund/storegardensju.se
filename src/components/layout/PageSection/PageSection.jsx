import PropTypes from "prop-types";
import "./PageSection.css";

/**
 * PageSection - A semantic section wrapper with consistent styling.
 *
 * Use ariaLabelledBy when the section contains a heading element with a matching id.
 * Use ariaLabel for sections without visible headings.
 */
function PageSection({
  children,
  background,
  spacing,
  ariaLabel,
  ariaLabelledBy,
}) {
  const sectionClasses = `page-section ${
    background ? `bg-${background}` : ""
  } ${spacing ? `spacing-${spacing}` : ""}`;

  // Build aria attributes - prefer ariaLabelledBy over ariaLabel
  const ariaAttributes = {};
  if (ariaLabelledBy) {
    ariaAttributes["aria-labelledby"] = ariaLabelledBy;
  } else if (ariaLabel) {
    ariaAttributes["aria-label"] = ariaLabel;
  }

  return (
    <section className={sectionClasses} {...ariaAttributes}>
      <div className="page-section-content">{children}</div>
    </section>
  );
}

PageSection.propTypes = {
  children: PropTypes.node,
  background: PropTypes.string,
  spacing: PropTypes.string,
  /** Direct aria-label for sections without visible headings */
  ariaLabel: PropTypes.string,
  /** ID of the heading element that labels this section */
  ariaLabelledBy: PropTypes.string,
};

PageSection.defaultProps = {
  background: "white",
  spacing: "default",
  ariaLabel: "",
  ariaLabelledBy: "",
};

export default PageSection;
