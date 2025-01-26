// eslint-disable-next-line no-unused-vars
import React from "react";
import FadeInSection from "./FadeInSection.jsx"; // Denna komponent används för fade-in effekt på varje bild
import FadeInSectionOnScroll from "./FadeInSectionOnScroll.jsx"; // Denna komponent används för att ge hela sektionen en fade-in effekt på scroll
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";
import slide4 from "../assets/slide4.jpg";
import slide5 from "../assets/slide5.jpg";

function ImageSlider() {
    return (
        <FadeInSectionOnScroll>
            <div className="index-bilder">
                <FadeInSection>
                    <img src={slide1} alt="Bild 1" />
                </FadeInSection>
                <FadeInSection>
                    <img src={slide2} alt="Bild 2" />
                </FadeInSection>
                <FadeInSection>
                    <img src={slide3} alt="Bild 3" />
                </FadeInSection>
                <FadeInSection>
                    <img src={slide4} alt="Bild 4" />
                </FadeInSection>
                <FadeInSection>
                    <img src={slide5} alt="Bild 5" />
                </FadeInSection>
            </div>
        </FadeInSectionOnScroll>
    );
}

export default ImageSlider;

