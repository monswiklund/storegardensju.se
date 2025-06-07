import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

const FadeInSection = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kort fördröjning för att säkerställa att fade-in animationen körs efter att komponenten har monterats
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
      <div className={`fade-in-section ${isVisible ? "is-visible" : ""}`}>
        {children}
      </div>
  );
};

FadeInSection.propTypes = {
  children: PropTypes.node.isRequired
};

export default FadeInSection;