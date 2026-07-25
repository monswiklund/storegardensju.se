import PropTypes from "prop-types";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import "./FadeInSection.css";

/**
 * FadeInSection - Animates children into view when scrolled into viewport.
 * Uses shared IntersectionObserver for better performance.
 */
const FadeInSection = ({
  children,
  threshold = 0.05,
  rootMargin = "0px 0px -5% 0px",
}) => {
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

export default FadeInSection;
