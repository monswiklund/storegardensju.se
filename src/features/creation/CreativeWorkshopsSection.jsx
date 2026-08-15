import "./Creation.css";
import { creationContent } from "../../data/homeContent.js";
import usePageCopy from "../../hooks/usePageCopy.js";
import usePageMedia from "../../hooks/usePageMedia.js";

function CreativeWorkshopsSection() {
  const copy = usePageCopy("art");
  const media = usePageMedia("art");
  const { sections } = creationContent;

  // Let's pair each section with a beautiful, high-quality image path
  const sectionImages = [
    media("workshops.0", "/images/evenemang/maleri-kurs.webp", "card"),
    media("workshops.1", "/images/evenemang/heldag-paket.webp", "card"),
    media("workshops.2", "/images/lokal/slide23.webp", "card")
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
                  <h3>{copy(`workshops.${index}.heading`, section.heading)}</h3>
                  {section.body.map((paragraph, idx) => (
                    <p key={idx}>
                      {copy(`workshops.${index}.paragraphs.${idx}`, paragraph)}
                    </p>
                  ))}
                </div>
                <div className="creation-row__image-wrapper">
                  {sectionImages[index] && <img
                    src={sectionImages[index]} 
                    alt={section.heading} 
                    className="creation-row__image"
                    loading="lazy"
                    decoding="async"
                  />}
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
