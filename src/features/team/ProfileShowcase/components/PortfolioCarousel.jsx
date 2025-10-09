import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import ProfileCard from "./ProfileCard";
import PortfolioSlide from "./PortfolioSlide";

function SwipeIndicator() {
  return (
    <div className="swipe-indicator">
      <span>Swipe</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.5 15L12.5 10L7.5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PortfolioCarousel({ profile }) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "default";
    }
  }, []);

  return (
    <div className="portfolio-gallery">
      <SwipeIndicator />
      <div className="portfolio-scroll-container" ref={scrollContainerRef}>
        <div className="profile-slide-wrapper">
          <ProfileCard profile={profile} />
        </div>

        {profile.portfolio && profile.portfolio.length > 0 ? (
          profile.portfolio.map((item, index) => (
            <PortfolioSlide key={`${item.src}-${index}`} item={item} />
          ))
        ) : (
          <div className="portfolio-placeholder">
            <p></p>
          </div>
        )}
      </div>
    </div>
  );
}

PortfolioCarousel.propTypes = {
  profile: PropTypes.shape({
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

export default PortfolioCarousel;
