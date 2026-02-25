import PropTypes from "prop-types";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import "./FadeInSection.css";

/**
 * FadeInSection - Animates children into view when scrolled into viewport.
 * Uses shared IntersectionObserver for better performance.
 */
const FadeInSection = ({ children, threshold, rootMargin }) => {
  const { ref, isVisible } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
    >
      {children}
    </div>
  );
};

FadeInSection.propTypes = {
  children: PropTypes.node.isRequired,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
};

FadeInSection.defaultProps = {
  threshold: 0.2,
  rootMargin: "0px 0px -10% 0px",
};

export default FadeInSection;
