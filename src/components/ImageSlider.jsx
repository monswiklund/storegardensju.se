import React, { useState, useEffect } from 'react';

function ImageSlider() {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [images, setImages] = useState([]);

    useEffect(() => {
        // Dynamiskt importera alla bilder från slides-mappen
        const importAllImages = async () => {
            try {
                // För Vite - importera alla bilder från slides-mappen
                const imageContext = import.meta.glob('/src/assets/slides/*.jpg');

                // För absolut sökväg till projektmappen, inte filsystemets sökväg
                // Detta kommer att använda den relativa sökvägen i byggprocessen

                const loadedImages = [];

                // Ladda varje bild
                const promises = Object.entries(imageContext).map(async ([path, importFunc]) => {
                    const imported = await importFunc();
                    // Extrahera filnamnet från sökvägen
                    const filename = path.split('/').pop();
                    // Extrahera numret om det finns, annars använd indexet
                    const match = filename.match(/slide(\d+)\.jpg$/i);
                    const index = match ? parseInt(match[1]) : path;

                    return { path, index, module: imported };
                });

                // Vänta på att alla bilder laddas
                const results = await Promise.all(promises);

                // Sortera efter index och skapa bildarray
                results.sort((a, b) => {
                    // Sortera numeriskt om båda har nummer
                    if (typeof a.index === 'number' && typeof b.index === 'number') {
                        return a.index - b.index;
                    }
                    // Alfabetisk sortering som fallback
                    return a.path.localeCompare(b.path);
                });

                const sortedImages = results.map((result, i) => ({
                    src: result.module.default,
                    alt: `Bild ${i + 1}`,
                    // Lägg till filnamn för debugging
                    filename: result.path.split('/').pop()
                }));

                setImages(sortedImages);
                console.log('Laddade bilder:', sortedImages);
            } catch (error) {
                console.error('Fel vid laddning av bilder:', error);
                console.error('Detaljerad information:', error.stack);
            }
        };

        importAllImages();
    }, []);

    const openLightbox = (index) => {
        setActiveImage(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const navigateNext = () => {
        setActiveImage((prev) => (prev + 1) % images.length);
    };

    const navigatePrev = () => {
        setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    };

    // Om inga bilder har laddats än
    if (images.length === 0) {
        return <div>Laddar bilder...</div>;
    }

    return (
        <div className="image-slider">
            {/* Visa miniatyrbilder */}
            <div className="thumbnails">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image.src}
                        alt={image.alt}
                        onClick={() => openLightbox(index)}
                        className="thumbnail"
                    />
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="lightbox">
                    <button className="close-button" onClick={closeLightbox}>×</button>
                    <button className="nav-button prev" onClick={navigatePrev}>‹</button>
                    <div className="lightbox-content">
                        <img
                            src={images[activeImage].src}
                            alt={images[activeImage].alt}
                        />
                    </div>
                    <button className="nav-button next" onClick={navigateNext}>›</button>
                </div>
            )}
        </div>
    );
}

export default ImageSlider;