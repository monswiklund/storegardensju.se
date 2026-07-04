import "./Services.css";
import { Link } from "react-router-dom";
import { services as servicesData } from "../../../data/homeContent.js";

const HomeServicesSection = () => {
  return (
    <section className="services-section" aria-labelledby="services-heading">
      <div className="services-container">
        <div className="services-header">
          <div className="services-header__title">
            <h2 id="services-heading">Vad vi erbjuder</h2>
          </div>
          <p className="services-intro">
          </p>
        </div>

        <div className="services-grid">
          {servicesData.map((service) => (
            <Link
              key={service.id}
              to={service.route}
              className="service-card"
              aria-label={`${service.ctaLabel}: ${service.title}`}
            >
              <div className="service-card__image-wrap">
                <img
                  src={service.image}
                  alt=""
                  className="service-card__image"
                  loading="lazy"
                />
              </div>

              <div className="service-card__content">
                <div className="service-card__topline">
                  <span className="service-card__kicker">{service.kicker}</span>
                </div>

                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">
                  {service.description}
                </p>
                <div className="service-card__bottom">
                  <span className="service-card__meta">{service.meta}</span>
                  <span className="service-card__cta">
                    {service.ctaLabel}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="service-card__arrow"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeServicesSection;
