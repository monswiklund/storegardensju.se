import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import ProfileCard from "./ProfileCard";
import PortfolioSlide from "./PortfolioSlide";

import { useSiteCopy } from "../../../../hooks/usePageCopy";

function SwipeIndicator() {
  const siteCopy = useSiteCopy();
  return (
    <div className="swipe-indicator">
      <span>{siteCopy("ui.swipe") || "Swipe"}</span>
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
  const siteCopy = useSiteCopy();
  const scrollContainerRef = useRef(null);
  const hasPortfolio = profile.portfolio && profile.portfolio.length > 0;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "default";
    }
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -500 : 500;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`portfolio-gallery ${!hasPortfolio ? "no-portfolio" : ""}`}>
      {hasPortfolio && (
        <>
          <SwipeIndicator />
          <button
            className="nav-arrow prev"
            onClick={() => scroll("left")}
            aria-label={siteCopy("ui.previous-image")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="nav-arrow next"
            onClick={() => scroll("right")}
            aria-label={siteCopy("ui.next-image")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
      <div className="portfolio-scroll-container" ref={scrollContainerRef}>
        <div className="profile-slide-wrapper">
          <ProfileCard profile={profile} />
        </div>

        {hasPortfolio ? (
          profile.portfolio.map((item, index) => (
            <PortfolioSlide key={`${item.src}-${index}`} item={item} />
          ))
        ) : null}
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
