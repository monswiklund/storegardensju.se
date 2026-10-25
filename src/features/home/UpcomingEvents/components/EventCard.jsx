import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowUpRight, CalendarDays } from "lucide-react";
import { canonicalPath } from "../../../../config/routes.js";
import { useSiteCopy } from "../../../../hooks/usePageCopy.js";
import SessionSchedule from "./SessionSchedule.jsx";

const splitDateString = (dateStr) => {
  if (!dateStr) return { day: "", month: "", year: "" };
  const parts = dateStr.split(" ");
  return {
    day: parts[0] || "",
    month: (parts[1] || "").toUpperCase(),
    year: parts[2] || "",
  };
};

// The booking state the editor set, as the label the course hubs use; none for an open event.
const STATUS_COPY = {
  cancelled: ["ui.cancelled", "Inställt"],
  fully_booked: ["ui.spot-sold-out", "Fullbokat"],
  few_left: ["ui.spot-few-left", "Få platser kvar"],
};

const SmartLink = ({ href, className, children, ...props }) => {
  const isInternal = href && href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return (
      <Link to={canonicalPath(href)} className={className} {...props}>
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
  const siteCopy = useSiteCopy();
  const { title, spots, date, time, range, location, links, link, linkLabel, image, sessions, status } = event;
  const statusLabel = STATUS_COPY[status] ? siteCopy(...STATUS_COPY[status]) : "";
  const cancelled = status === "cancelled";
  const eventDate = splitDateString(date);
  const eventLinks = links || (link ? [{ href: link, label: linkLabel ?? siteCopy("ui.read-more") }] : []);
  const primaryLink = eventLinks[0] || null;
  const isSeries = sessions?.length > 1;

  return (
    <article className={`upcoming-event-card${isSeries ? " is-series" : ""}${cancelled ? " is-cancelled" : ""}`}>
      <div className="upcoming-card-media">
        {image?.src && (
          <img src={image.src} alt={image.alt || ""} className="upcoming-card-image" loading="lazy" decoding="async" />
        )}
        <div className="upcoming-card-date">
          <span className="upcoming-date-day">{eventDate.day}</span>
          <span className="upcoming-date-month">{eventDate.month}</span>
          <span className="upcoming-date-year">{eventDate.year}</span>
        </div>
      </div>

      <div className="upcoming-card-body">
        {statusLabel && <p className={`upcoming-card-status is-${status}`}>{statusLabel}</p>}
        <h3 className="upcoming-event-title">{title}</h3>

        <ul className="upcoming-event-meta">
          {time && (
            <li>
              <Clock size={18} aria-hidden="true" />
              <span>{time}</span>
            </li>
          )}
          {range && (
            <li>
              <CalendarDays size={18} aria-hidden="true" />
              <span>{range}</span>
            </li>
          )}
          {location && (
            <li>
              <MapPin size={18} aria-hidden="true" />
              <span>{location}</span>
            </li>
          )}
        </ul>

        {isSeries && <SessionSchedule key={event.id} sessions={sessions} />}

        {((spots && !cancelled) || primaryLink) && (
          <div className="upcoming-card-footer">
            {spots && !cancelled && <p className="upcoming-card-spots">{spots}</p>}
            {primaryLink && (
              <SmartLink href={primaryLink.href} className="btn btn--primary">
                <span>{primaryLink.label}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </SmartLink>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    spots: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    range: PropTypes.string,
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
    sessions: PropTypes.array,
    status: PropTypes.oneOf(["open", "few_left", "fully_booked", "cancelled"]),
  }).isRequired,
};

export default EventCard;
