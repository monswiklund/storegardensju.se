// Uppdaterad ImageSlider.jsx med tydligare pilar
import React, { useState } from "react";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";
import slide4 from "../assets/slide4.jpg";
import slide5 from "../assets/slide5.jpg";

function ImageSlider() {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    const images = [
        { src: slide1, alt: "Bild 1" },
        { src: slide2, alt: "Bild 2" },
        { src: slide3, alt: "Bild 3" },
        { src: slide4, alt: "Bild 4" },
        { src: slide5, alt: "Bild 5" }
    ];

    const openLightbox = (index) => {
        setActiveImage(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Hindra scrollning när lightbox är öppen
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto'; // Återaktivera scrollning
    };

    const goPrev = (e) => {
        e.stopPropagation(); // Förhindra att klick på pilen stänger lightbox
        setActiveImage((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const goNext = (e) => {
        e.stopPropagation(); // Förhindra att klick på pilen stänger lightbox
        setActiveImage((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <>
            <div className="gallery-container">
                <div className="gallery-grid">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="gallery-item"
                            onClick={() => openLightbox(index)}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="gallery-image"
                            />
                            <div className="gallery-image-overlay"></div>
                        </div>
                    ))}
                </div>
            </div>

            {lightboxOpen && (
                <div className="lightbox">
                    <div className="lightbox-overlay" onClick={closeLightbox}></div>
                    <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
                    <div className="lightbox-content-container">
                        <button className="lightbox-arrow lightbox-prev" onClick={goPrev}>&lt;</button>
                        <div className="lightbox-content">
                            <img
                                src={images[activeImage].src}
                                alt={images[activeImage].alt}
                                className="lightbox-image"
                            />
                            <div className="image-counter">{activeImage + 1} / {images.length}</div>
                        </div>
                        <button className="lightbox-arrow lightbox-next" onClick={goNext}>&gt;</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ImageSlider;