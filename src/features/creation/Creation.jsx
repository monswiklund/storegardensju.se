import "./CreationStyles.css";
import { creationContent } from "../../data/homeContent.js";

function Creation() {
  const { title, sections, offerings } = creationContent;

  return (
    <div id="creation-section" className="creation-section">
      <div className="creation-container">
        <h2 id="creation-heading">{title}</h2>
        <div className="creation-content">
          <div className="creation-text">
            {sections.map((section) => (
              <div key={section.heading}>
                <h3>{section.heading}</h3>
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="creation-info">
            <h4>Vad vi erbjuder:</h4>
            <ul>
              {offerings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Creation;
