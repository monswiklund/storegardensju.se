import PropTypes from "prop-types";

function HomeHeroLogo({ imageSrc, alt, ref = undefined }) {
  return (
    <div className="hero-logo" ref={ref}>
      <img src={imageSrc} alt={alt} />
    </div>
  );
}

HomeHeroLogo.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

export default HomeHeroLogo;
