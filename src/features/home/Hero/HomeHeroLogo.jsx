import PropTypes from "prop-types";
import { forwardRef } from "react";

const HomeHeroLogo = forwardRef(function HomeHeroLogo({ imageSrc, alt }, ref) {
  return (
    <div className="hero-logo" ref={ref}>
      <img src={imageSrc} alt={alt} />
    </div>
  );
});

HomeHeroLogo.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export default HomeHeroLogo;
