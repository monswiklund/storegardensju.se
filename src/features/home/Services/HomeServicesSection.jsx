import "./Services.css";
import { Link } from "react-router-dom";
import { services as servicesData } from "../../../data/homeContent.js";

const HomeServicesSection = () => {
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`#${sectionId}-section`);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="services-section">
      <div className="services-container">
        <h2 id="services-heading">Vad vi erbjuder</h2>
        <div className="services-grid">
          {servicesData.map((service, index) => {
            // If service has scrollTo property, render as clickable div instead of Link
            if (service.scrollTo) {
              return (
                <div
                  key={index}
                  className="service-card"
                  role="button"
                  tabIndex="0"
                  onClick={() => scrollToSection(service.scrollTo)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      scrollToSection(service.scrollTo);
                    }
                  }}
                  aria-label={`Läs mer om ${service.title}`}
                >
                  <div className="service-image-container">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="service-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-subtitle">{service.subtitle}</p>
                    <p className="service-description">{service.description}</p>
                    <span className="service-arrow">Läs mer</span>
                  </div>
                </div>
              );
            }

            // For services with route property, render as Link
            return (
              <Link
                key={index}
                to={service.route}
                className="service-card"
                aria-label={`Läs mer om ${service.title}`}
              >
                <div className="service-image-container">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="service-image"
                    loading="lazy"
                  />
                </div>
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-subtitle">{service.subtitle}</p>
                  <p className="service-description">{service.description}</p>
                  <span className="service-arrow">Läs mer</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeServicesSection;
