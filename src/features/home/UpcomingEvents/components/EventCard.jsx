import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowUpRight } from "lucide-react";

const splitDateString = (dateStr) => {
  if (!dateStr) return { day: "", month: "", year: "" };
  const parts = dateStr.split(" ");
  return {
    day: parts[0] || "",
    month: (parts[1] || "").toUpperCase(),
    year: parts[2] || "",
  };
};

const SmartLink = ({ href, className, children, ...props }) => {
  const isInternal = href && href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return (
      <Link to={href} className={className} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
};

function EventCard({ event }) {
  const { title, spots, date, time, location, links, link, linkLabel, image } = event;
  const eventDate = splitDateString(date);
  
  const eventLinks = links || (link ? [{ href: link, label: linkLabel ?? "Läs mer" }] : []);
  const primaryLink = eventLinks[0] || null;

  return (
    <div className="upcoming-event-card">
      {/* Info Side (Left on desktop, Bottom on mobile) */}
      <div className="upcoming-card-info">
        <div className="upcoming-card-date-badge desktop-only">
          <span className="upcoming-date-day">{eventDate.day}</span>
          <span className="upcoming-date-month">{eventDate.month}</span>
          <span className="upcoming-date-year">{eventDate.year}</span>
        </div>
        
        <div className="upcoming-card-details">
          {spots && (
            <span className="upcoming-spots-pill">
              {spots}
            </span>
          )}
          
          <h3 className="upcoming-event-title">{title}</h3>
          
          <div className="upcoming-event-meta">
            {time && (
              <div className="upcoming-meta-item">
                <Clock size={16} />
                <span>{time}</span>
              </div>
            )}
            {location && (
              <div className="upcoming-meta-item">
                <MapPin size={16} />
                <span>{location}</span>
              </div>
            )}
          </div>

          {/* Stacked actions inside card for Mobile only */}
          <div className="upcoming-card-actions mobile-only">
            {primaryLink && (
              <SmartLink href={primaryLink.href} className="btn-primary-event">
                <span>{primaryLink.label}</span>
                <ArrowUpRight size={16} />
              </SmartLink>
            )}
          </div>
        </div>
      </div>

      {/* Image Side (Right on desktop, Top on mobile) */}
      <div className="upcoming-card-image-wrap">
        {image?.src && (
          <img
            src={image.src}
            alt={image.alt || ""}
            className="upcoming-card-image"
            loading="lazy"
            decoding="async"
          />
        )}
        {/* Overlay Date badge for Mobile only */}
        <div className="upcoming-card-date-badge-overlay mobile-only">
          <span className="upcoming-date-day">{eventDate.day}</span>
          <span className="upcoming-date-month">{eventDate.month}</span>
          <span className="upcoming-date-year">{eventDate.year}</span>
        </div>
      </div>
    </div>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    spots: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    location: PropTypes.string,
    link: PropTypes.string,
    linkLabel: PropTypes.string,
    links: PropTypes.arrayOf(
      PropTypes.shape({
        href: PropTypes.string.isRequired,
        label: PropTypes.string,
      })
    ),
    image: PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    }),
  }).isRequired,
};

export default EventCard;
