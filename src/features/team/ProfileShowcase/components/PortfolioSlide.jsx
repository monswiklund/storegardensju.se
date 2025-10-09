import PropTypes from "prop-types";

function PortfolioSlide({ item }) {
  return (
    <div className="portfolio-slide">
      <img src={item.src} alt={item.alt || "Portfolio bild"} loading="lazy" />
      <div className="portfolio-overlay">
        {item.title && <h3>{item.title}</h3>}
        {item.caption && <p>{item.caption}</p>}
      </div>
    </div>
  );
}

PortfolioSlide.propTypes = {
  item: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    caption: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
};

export default PortfolioSlide;
