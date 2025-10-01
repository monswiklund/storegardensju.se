import "./ServicesStyles.css";
import { Link } from 'react-router-dom';

function Services() {
  const services = [
      {
          id: "event-fest",
          title: "Event, Bröllop & Fest",
          subtitle: "Boka lokalen för ditt nästa evenemang",
          description: "",
          route: "/event",
          icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
                  <path d="M12 3v6"/>
              </svg>
          )
      },
      {
      id: "skapande",
      title: "Kurser & Skapande",
      subtitle: "Målning & Lera",
      description: "Kreativa workshops i en inspirerande miljö",
      route: "/konst",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
          <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
        </svg>
      )
    },
    {
      id: "evenemang",
      title: "Kommande evenemang",
      subtitle: "Se vad som händer",
      description: "Upptäck och boka våra kommande event",
      scrollTo: "evenemang",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`#${sectionId}-section`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="services-section" aria-labelledby="services-heading">
      <div className="services-container">
        <h2 id="services-heading">Vad vi erbjuder</h2>
        <div className="services-grid">
          {services.map((service, index) => {
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
                    {service.icon}
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-subtitle">{service.subtitle}</p>
                  <p className="service-description">{service.description}</p>
                  <span className="service-arrow">→</span>
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
                  {service.icon}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-subtitle">{service.subtitle}</p>
                <p className="service-description">{service.description}</p>
                <span className="service-arrow">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Services;
