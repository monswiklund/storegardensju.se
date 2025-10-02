import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Instagram,
  Globe,
} from "lucide-react";
import "./ProfileShowcaseStyles.css";

const ProfileShowcase = ({ profile, imageLayout = "default" }) => {
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);

  // Mouse drag handlers with improved "free" feel
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setLastX(e.pageX);
    setLastTime(Date.now());
    setVelocity(0);
    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
    // Prevent default to avoid text selection
    e.preventDefault();
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "auto";

      // Add momentum/inertia effect for free-flowing feel
      if (Math.abs(velocity) > 0.3) {
        const momentum = velocity * 300; // Increased momentum multiplier for freer feel
        const targetScroll = scrollContainerRef.current.scrollLeft - momentum;
        scrollContainerRef.current.scrollTo({
          left: targetScroll,
          behavior: "smooth",
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const currentTime = Date.now();
    const currentX = e.pageX;
    const timeDiff = currentTime - lastTime;

    if (timeDiff > 0) {
      setVelocity((currentX - lastX) / timeDiff);
    }

    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Slightly increased for more responsive free scrolling
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;

    setLastX(currentX);
    setLastTime(currentTime);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
        scrollContainerRef.current.style.userSelect = "auto";
      }
    }
  };

  // Touch handlers for mobile free drag
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartX(touch.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setLastX(touch.pageX);
    setLastTime(Date.now());
    setVelocity(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent default scroll behavior

    const touch = e.touches[0];
    const currentTime = Date.now();
    const currentX = touch.pageX;
    const timeDiff = currentTime - lastTime;

    if (timeDiff > 0) {
      setVelocity((currentX - lastX) / timeDiff);
    }

    const x = touch.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Natural 1:1 drag ratio
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;

    setLastX(currentX);
    setLastTime(currentTime);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Add momentum for touch as well
    if (Math.abs(velocity) > 0.5) {
      const momentum = velocity * 300; // Higher momentum for touch
      const targetScroll = scrollContainerRef.current.scrollLeft - momentum;
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // Set initial cursor style
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  }, []);

  const renderContactItem = (
    icon,
    content,
    href = null,
    isExternal = false
  ) => {
    const Icon = icon;
    const linkProps = isExternal
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <li className="showcase-contact-item">
        <Icon size={16} />
        {href ? (
          <a href={href} {...linkProps}>
            {content}
          </a>
        ) : (
          <span>{content}</span>
        )}
      </li>
    );
  };

  const renderPortfolioImage = (item, index) => {
    return (
      <div key={index} className="portfolio-slide">
        <img src={item.src} alt={item.alt || "Portfolio bild"} loading="lazy" />
        <div className="portfolio-overlay">
          {item.title && <h3>{item.title}</h3>}
          {item.caption && <p>{item.caption}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-showcase-row">
      {/* Portfolio horizontal scroll gallery with profile as first slide */}
      <div className="portfolio-gallery">
        {/* Swipe indicator - sticky absolute */}
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
        <div
          className="portfolio-scroll-container"
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Profile as first slide */}
          <div className="profile-slide-wrapper">
            <div className="profile-cell">
              {profile.imageSrc && (
                <img
                  className="profile-image"
                  src={profile.imageSrc}
                  alt={profile.imageAlt || "Profilbild"}
                />
              )}

              {profile.title && (
                <h3 className="profile-title">{profile.title}</h3>
              )}
              {profile.about && (
                <p className="profile-about">{profile.about}</p>
              )}

              {profile.texts && profile.texts.length > 0 && (
                <div className="profile-description">
                  {profile.texts.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </div>
              )}

              {profile.listItems && profile.listItems.length > 0 && (
                <div className="profile-skills">
                  <h4>Kompetenser</h4>
                  <ul>
                    {profile.listItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kontakt sektion */}
              {profile.contact && Object.keys(profile.contact).length > 0 && (
                <div className="profile-contact">
                  <h4>Kontakt</h4>
                  <ul className="showcase-contact-list">
                    {profile.contact.phone &&
                      renderContactItem(
                        Phone,
                        profile.contact.phone,
                        `tel:${profile.contact.phone}`
                      )}
                    {profile.contact.email &&
                      renderContactItem(
                        Mail,
                        profile.contact.email,
                        `mailto:${profile.contact.email}`
                      )}
                    {profile.contact.address &&
                      renderContactItem(MapPin, profile.contact.address)}
                    {profile.contact.github &&
                      renderContactItem(
                        Github,
                        "GitHub",
                        `https://${profile.contact.github}`,
                        true
                      )}
                    {profile.contact.linkedin &&
                      renderContactItem(
                        Linkedin,
                        "LinkedIn",
                        `https://${profile.contact.linkedin}`,
                        true
                      )}
                    {profile.contact.instagram &&
                      renderContactItem(
                        Instagram,
                        "Instagram",
                        `https://${profile.contact.instagram}`,
                        true
                      )}
                    {profile.contact.webpage &&
                      renderContactItem(
                        Globe,
                        "Hemsida",
                        `https://${profile.contact.webpage}`,
                        true
                      )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio images */}
          {profile.portfolio && profile.portfolio.length > 0 ? (
            profile.portfolio.map((item, index) =>
              renderPortfolioImage(item, index)
            )
          ) : (
            <div className="portfolio-placeholder">
              <p>Portfolio bilder kommer snart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileShowcase.propTypes = {
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
    portfolio: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string,
        caption: PropTypes.string,
        title: PropTypes.string,
      })
    ),
  }).isRequired,
  imageLayout: PropTypes.string,
};

export default ProfileShowcase;
