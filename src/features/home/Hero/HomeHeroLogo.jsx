import PropTypes from "prop-types";

function HomeHeroLogo({ imageSrc, alt }) {
  return (
    <div className="hero-logo">
      <img src={imageSrc} alt={alt} />
    </div>
  );
}

HomeHeroLogo.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export default HomeHeroLogo;
