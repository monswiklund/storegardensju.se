import "./Creation.css";
import { creationContent } from "../../data/homeContent.js";

function CreativeWorkshopsSection() {
  const { sections } = creationContent;

  // Let's pair each section with a beautiful, high-quality image path
  const sectionImages = [
    "/images/evenemang/maleri-kurs.webp",
    "/images/evenemang/heldag-paket.webp",
    "/images/lokal/slide23.webp"
  ];

  return (
    <div id="creation-section" className="creation-section">
      <div className="creation-container">
        <div className="creation-rows">
          {sections.map((section, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={section.heading} 
                className={`creation-row ${isEven ? "row-normal" : "row-reverse"}`}
              >
                <div className="creation-row__text">
                  <h3>{section.heading}</h3>
                  {section.body.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
                <div className="creation-row__image-wrapper">
                  <img 
                    src={sectionImages[index]} 
                    alt={section.heading} 
                    className="creation-row__image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="creation-row__image-overlay" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CreativeWorkshopsSection;
