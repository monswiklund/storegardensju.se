import "./Creation.css";
import { creationContent } from "../../data/homeContent.js";
import usePageMedia from "../../hooks/usePageMedia.js";
import usePageLists from "../../hooks/usePageLists.js";

function CreativeWorkshopsSection() {
  const media = usePageMedia("art");
  const list = usePageLists("art");
  const { sections } = creationContent;
  const workshopSections = list(
    "workshops",
    sections.map((section) => ({ title: section.heading, body: section.body.join("\n\n") })),
  );

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
          {workshopSections.map((section, index) => {
            const isEven = index % 2 === 0;
            const paragraphs = String(section.body || "")
              .split(/\n\s*\n/)
              .filter(Boolean);
            return (
              <div 
                key={section.id || section.title || index}
                className={`creation-row ${isEven ? "row-normal" : "row-reverse"}`}
              >
                <div className="creation-row__text">
                  <h3>{section.title}</h3>
                  {paragraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
                <div className="creation-row__image-wrapper">
                  {sectionImages[index] && <img
                    src={sectionImages[index]} 
                    alt={section.title || "Bild från ateljén"}
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
