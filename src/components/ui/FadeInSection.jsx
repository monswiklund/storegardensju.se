import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./FadeInSection.css";

const FadeInSection = ({ children, threshold }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div ref={containerRef} className={`fade-in-section ${isVisible ? "is-visible" : ""}`}>
      {children}
    </div>
  );
};

FadeInSection.propTypes = {
  children: PropTypes.node.isRequired,
  threshold: PropTypes.number
};

FadeInSection.defaultProps = {
  threshold: 0.2
};

export default FadeInSection;
