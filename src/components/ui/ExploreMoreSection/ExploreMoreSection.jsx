import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./ExploreMoreSection.css";

function ExploreMoreSection({
  id = "explore-more",
  eyebrow = "Utforska mer",
  title,
  intro = "",
  items,
  background = "green",
}) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      className={`explore-more-section explore-more-section--${background}`}
      aria-labelledby={headingId}
    >
      <div className="explore-more-section__inner">
        <div className="explore-more-section__heading">
          <span className="explore-more-section__eyebrow">{eyebrow}</span>
          <h2 id={headingId}>{title}</h2>
          {intro && <p>{intro}</p>}
        </div>

        <div
          className={`explore-more-section__grid${
            items.length === 1 ? " explore-more-section__grid--single" : ""
          }`}
        >
          {items.map((item) => (
            <Link
              className={`explore-more-section__card${
                item.featured ? " explore-more-section__card--featured" : ""
              }`}
              to={item.to}
              key={item.to}
            >
              <span className="explore-more-section__card-eyebrow">
                {item.eyebrow}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

ExploreMoreSection.propTypes = {
  id: PropTypes.string,
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  intro: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      eyebrow: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      featured: PropTypes.bool,
    })
  ).isRequired,
  background: PropTypes.oneOf(["white", "alt", "green"]),
};

export default ExploreMoreSection;
