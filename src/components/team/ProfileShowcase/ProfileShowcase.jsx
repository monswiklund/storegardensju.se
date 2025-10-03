import PropTypes from "prop-types";
import { useRef, useEffect } from "react";
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

  // Set initial cursor style for desktop (no drag)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "default";
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
        <div className="portfolio-scroll-container" ref={scrollContainerRef}>
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

              {/* Action buttons */}
              {profile.actions && profile.actions.length > 0 && (
                <div className="profile-actions">
                  {profile.actions.map((action, index) => (
                    <a
                      key={index}
                      href={action.href}
                      className={`profile-action-btn ${action.primary ? 'primary' : 'secondary'}`}
                      target={action.external ? "_blank" : undefined}
                      rel={action.external ? "noopener noreferrer" : undefined}
                    >
                      {action.label}
                    </a>
                  ))}
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
              <p></p>
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
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        href: PropTypes.string.isRequired,
        primary: PropTypes.bool,
        external: PropTypes.bool,
      })
    ),
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
