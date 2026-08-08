import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { canonicalPath } from "../../../config/routes.js";
import "./ProfileShowcase.css";
import ContactList from "./components/ContactList";
import ActionButtons from "./components/ActionButtons";

const TeamProfileShowcase = ({ profile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hasPortfolio = profile.portfolio && profile.portfolio.length > 0;

  const openModal = (index = 0) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = useCallback((e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % profile.portfolio.length);
  }, [profile.portfolio.length]);

  const prevImage = useCallback((e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + profile.portfolio.length) % profile.portfolio.length);
  }, [profile.portfolio.length]);

  // Lock scrolling when modal is open (including Lenis compatibility)
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      if (window.storegardenLenis) {
        window.storegardenLenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      if (window.storegardenLenis) {
        window.storegardenLenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (window.storegardenLenis) {
        window.storegardenLenis.start();
      }
    };
  }, [isModalOpen]);

  // Handle keyboard events for accessibility/UX
  useEffect(() => {
    if (!isModalOpen || !hasPortfolio) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowRight") {
        nextImage(e);
      } else if (e.key === "ArrowLeft") {
        prevImage(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, hasPortfolio, nextImage, prevImage]);

  return (
    <div className="team-card">
      <div className="team-card-image-container">
        {profile.imageSrc && (
          <img
            className="team-card-image"
            src={profile.imageSrc}
            alt={profile.imageAlt || `Profilbild för ${profile.title}`}
            loading="lazy"
          />
        )}
      </div>

      <div className="team-card-content">
        {profile.title && <h3 className="team-card-title">{profile.title}</h3>}
        {profile.about && <p className="team-card-subtitle">{profile.about}</p>}
        


        {profile.listItems && profile.listItems.length > 0 && (
          <div className="team-card-tags">
            {profile.listItems.map((item, index) => (
              <span key={index} className="team-card-tag">
                {item}
              </span>
            ))}
          </div>
        )}

        <ContactList contact={profile.contact} />
        
        {profile.actions && profile.actions.length > 0 && (
          <ActionButtons actions={profile.actions} />
        )}

        {profile.portfolioUrl ? (
          <Link
            to={canonicalPath(profile.portfolioUrl)}
            className="team-card-portfolio-btn"
            aria-label={`Visa portfolio för ${profile.title}`}
          >
            <ImageIcon size={16} />
            <span>Visa Portfolio</span>
          </Link>
        ) : hasPortfolio && (
          <button
            className="team-card-portfolio-btn"
            onClick={() => openModal(0)}
            aria-label={`Visa portfolio för ${profile.title}`}
          >
            <ImageIcon size={16} />
            <span>Visa Portfolio</span>
          </button>
        )}
      </div>

      {isModalOpen && hasPortfolio && createPortal(
        <div className="portfolio-modal" onClick={closeModal} role="dialog" aria-modal="true">
          <button className="portfolio-modal-close" onClick={closeModal} aria-label="Stäng modal">
            <X size={24} />
          </button>
          
          <div className="portfolio-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            {profile.portfolio.length > 1 && (
              <button className="portfolio-modal-nav prev" onClick={prevImage} aria-label="Föregående projekt">
                <ChevronLeft size={36} />
              </button>
            )}
            
            <div className="portfolio-modal-main-image">
              {profile.portfolio[activeImageIndex].src ? (
                <img
                  src={profile.portfolio[activeImageIndex].src}
                  alt={profile.portfolio[activeImageIndex].alt || profile.portfolio[activeImageIndex].title || `Portföljbild ${activeImageIndex + 1}`}
                />
              ) : (
                <div className="portfolio-modal-project-card">
                  <div className="portfolio-project-icon">
                    <ImageIcon size={48} />
                  </div>
                  <h3>{profile.portfolio[activeImageIndex].title}</h3>
                  <p>{profile.portfolio[activeImageIndex].caption}</p>
                  {profile.portfolio[activeImageIndex].tags && (
                    <div className="portfolio-project-tags">
                      {profile.portfolio[activeImageIndex].tags.map((tag, i) => (
                        <span key={i} className="portfolio-project-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  {profile.portfolio[activeImageIndex].link && (
                    <a
                      href={profile.portfolio[activeImageIndex].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portfolio-project-link-btn"
                    >
                      Besök projekt
                    </a>
                  )}
                </div>
              )}
              {profile.portfolio[activeImageIndex].src && (profile.portfolio[activeImageIndex].title || profile.portfolio[activeImageIndex].caption) && (
                <div className="portfolio-modal-caption">
                  {profile.portfolio[activeImageIndex].title && <h4>{profile.portfolio[activeImageIndex].title}</h4>}
                  {profile.portfolio[activeImageIndex].caption && <p>{profile.portfolio[activeImageIndex].caption}</p>}
                </div>
              )}
            </div>

            {profile.portfolio.length > 1 && (
              <button className="portfolio-modal-nav next" onClick={nextImage} aria-label="Nästa projekt">
                <ChevronRight size={36} />
              </button>
            )}
          </div>

          {profile.portfolio.length > 1 && (
            <div className="portfolio-modal-thumbnails" onClick={(e) => e.stopPropagation()}>
              {profile.portfolio.map((item, idx) => (
                <button
                  key={idx}
                  className={`portfolio-modal-thumb-btn ${idx === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Visa ${item.title || `objekt ${idx + 1}`}`}
                >
                  {item.src ? (
                    <img src={item.src} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="thumb-project-title">{item.title || idx + 1}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

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
        src: PropTypes.string,
        alt: PropTypes.string,
        caption: PropTypes.string,
        title: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        link: PropTypes.string,
      }),
    ),
  }).isRequired,
};

export default TeamProfileShowcase;
