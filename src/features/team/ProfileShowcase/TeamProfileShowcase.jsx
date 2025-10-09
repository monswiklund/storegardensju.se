import PropTypes from "prop-types";
import "./ProfileShowcase.css";
import PortfolioCarousel from "./components/PortfolioCarousel";

const TeamProfileShowcase = ({ profile }) => (
  <div className="profile-showcase-row">
    <PortfolioCarousel profile={profile} />
  </div>
);

TeamProfileShowcase.propTypes = {
  profile: PropTypes.shape({
    title: PropTypes.string,
    about: PropTypes.string,
    texts: PropTypes.arrayOf(PropTypes.string),
    listItems: PropTypes.arrayOf(PropTypes.string),
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    contact: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
      linkedin: PropTypes.string,
      github: PropTypes.string,
      instagram: PropTypes.string,
      webpage: PropTypes.string,
    }),
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        href: PropTypes.string.isRequired,
        primary: PropTypes.bool,
        external: PropTypes.bool,
      }),
    ),
    portfolio: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string,
        caption: PropTypes.string,
        title: PropTypes.string,
      }),
    ),
  }).isRequired,
};

export default TeamProfileShowcase;
