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

        <div className="services-list">
          {servicesData.map((service) => (
            <Link
              key={service.id}
              to={service.route}
              className="service-row"
              aria-label={`${service.ctaLabel}: ${service.title}`}
            >
              <div className="service-row__image-wrap">
                <img
                  src={service.image}
                  alt=""
                  className="service-row__image"
                  loading="lazy"
                />
              </div>

              <div className="service-row__content">
                <div className="service-row__topline">
                  <span className="service-row__kicker">{service.kicker}</span>
                </div>

                <h3 className="service-row__title">{service.title}</h3>
                <p className="service-row__description">
                  {service.description}
                </p>
                <span className="service-row__meta">{service.meta}</span>
              </div>

              <span className="service-row__cta">
                {service.ctaLabel}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeServicesSection;
