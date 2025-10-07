import "./ServicesStyles.css";
import { Link } from 'react-router-dom';
import { services as servicesData } from "../../../data/homeContent.js";

const iconMap = {
  venue: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
      <path d="M12 3v6"/>
    </svg>
  ),
  creative: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
      <path
        d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
    </svg>
  )
};

const Services = () => {
    const scrollToSection = (sectionId) => {
        const element = document.querySelector(`#${sectionId}-section`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      scrollToSection(service.scrollTo);
                    }
                  }}
                  aria-label={`Läs mer om ${service.title}`}
                >
                  <div className="service-icon">
                    {iconMap[service.icon]}
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-subtitle">{service.subtitle}</p>
                  <p className="service-description">{service.description}</p>
                  <span className="service-arrow">Läs mer</span>
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
                <div className="service-icon">
                  {iconMap[service.icon]}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-subtitle">{service.subtitle}</p>
                <p className="service-description">{service.description}</p>
                <span className="service-arrow">Läs mer</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Services;
