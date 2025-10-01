import { useState } from "react";
import "./FeaturedGalleryStyles.css";

function FeaturedGallery({ onViewAll }) {
  const featuredImages = [
    { src: "/images/lokal/slide1.jpg", alt: "Lokalen från insidan" },
    { src: "/images/lokal/slide3.jpg", alt: "Samlingsytan" },
    { src: "/images/evenemang/slide2.jpg", alt: "Evenemang" },
    { src: "/images/konst-keramik/slide16.jpg", alt: "Konstutställning" }
  ];

  return (
    <section className="featured-gallery-section" aria-labelledby="featured-gallery-heading">
      <div className="featured-gallery-container">
        <div className="featured-grid">
          {featuredImages.map((image, index) => (
            <div
              key={index}
              className={`featured-item featured-item-${index + 1}`}
              onClick={onViewAll}
              role="button"
              tabIndex={0}
              aria-label={`Visa alla bilder - ${image.alt}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onViewAll();
                }
              }}
            >
              <img src={image.src} alt={image.alt} loading="eager" />
              <div className="featured-overlay">
                <span className="view-more-text">Se alla bilder</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedGallery;
