import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Calendar
} from "lucide-react";
import "./UpcomingEvents.css";
import EventCard from "./components/EventCard";
import useScrollToSelector from "../../../hooks/useScrollToSelector";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [day, month, year] = formatted.split(" ");
  if (!day || !month || !year) return formatted;
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const toUiEvent = (item) => {
  const startAt = item?.startAt || "";
  const endAt = item?.endAt || "";
  const date = formatDate(startAt);
  const startTime = formatTime(startAt);
  const endTime = formatTime(endAt);

  const mappedImages = (Array.isArray(item?.images) ? item.images : []).map(img => ({
    ...img,
    src: img.url || img.src || ""
  }));

  return {
    title: item?.title || "",
    spots: item?.spots || "",
    date,
    time: startTime && endTime ? `${startTime} - ${endTime}` : "",
    description: item?.description || "",
    moments: Array.isArray(item?.moments) ? item.moments : [],
    artists: item?.artists || "",
    location: item?.location || "",
    links: Array.isArray(item?.links) ? item.links : [],
    image: mappedImages.length > 0 ? mappedImages[0] : null,
    images: mappedImages,
  };
};

// Helper component to render either react-router Link or standard anchor tag
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

function HomeUpcomingEventsSection({ upcomingEvents = [], loading = false, error = "" }) {
  const scrollToContact = useScrollToSelector(".contact-container");
  const scrollToPastEvents = useScrollToSelector("#past-events");
  const [currentUpcomingIndex, setCurrentUpcomingIndex] = useState(0);

  const activeEvent = upcomingEvents[currentUpcomingIndex] || null;
  const primaryLink = activeEvent?.links?.[0] || { href: "/kurser", label: "Läs mer & anmäl dig" };

  const nextUpcoming = () => {
    if (upcomingEvents.length <= 1) return;
    setCurrentUpcomingIndex((prev) => (prev + 1) % upcomingEvents.length);
  };

  const prevUpcoming = () => {
    if (upcomingEvents.length <= 1) return;
    setCurrentUpcomingIndex((prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
  };

  return (
    <div id="events-section" className="events-section">
      <div className="events-container">


        {loading && (
          <div className="events-status-panel">
            <p>Hämtar evenemang...</p>
          </div>
        )}

        {!loading && error && (
          <div className="events-status-panel">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          upcomingEvents.length > 0 ? (
            <div className="upcoming-events-layout">
              {/* Left Column: Text info and Call to action buttons */}
              <div className="upcoming-events-content-col">
                <span className="events-eyebrow">KOMMANDE EVENEMANG</span>
                <div className="section-ornament align-left" aria-hidden="true">
                  <span className="section-ornament-line"></span>
                  <Calendar size={18} />
                  <span className="section-ornament-line"></span>
                </div>
                <h2 className="events-heading-large">Nästa grej på Storegården</h2>
                <p className="events-description-large">
                  Här samlar vi kommande kurser, öppna ateljékvällar och andra
                  tillfällen att mötas och skapa på gården.
                </p>
                
                <div className="upcoming-desktop-actions desktop-only">
                  {primaryLink && (
                    <SmartLink href={primaryLink.href} className="btn-primary-event">
                      <span>{primaryLink.label}</span>
                      <ArrowUpRight size={16} />
                    </SmartLink>
                  )}
                </div>
              </div>

              {/* Right Column: Event card carousel */}
              <div className="upcoming-events-carousel-col">
                {activeEvent && (
                  <div className="upcoming-event-carousel">
                    <EventCard event={activeEvent} />

                    {/* Carousel Navigation (Dots & Chevrons) */}
                    <div className="carousel-controls-row">
                      <div className="carousel-dots-indicator">
                        {upcomingEvents.map((_, idx) => (
                          <button
                            key={idx}
                            className={`carousel-dot-indicator ${idx === currentUpcomingIndex ? "active" : ""}`}
                            onClick={() => setCurrentUpcomingIndex(idx)}
                            aria-label={`Visa evenemang ${idx + 1}`}
                          />
                        ))}
                      </div>
                      {upcomingEvents.length > 1 && (
                        <div className="carousel-nav-arrows">
                          <button className="carousel-nav-arrow" onClick={prevUpcoming} aria-label="Föregående">
                            <ChevronLeft size={18} />
                          </button>
                          <button className="carousel-nav-arrow" onClick={nextUpcoming} aria-label="Nästa">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="events-empty-panel">
              <span className="events-empty-kicker">Just nu</span>
              <h2>Inget nytt datum än.</h2>
              <p>
                Vill ni samla ett gäng på gården ordnar vi gärna en privat
                workshop eller en egen dag tillsammans.
              </p>
              <div className="events-empty-actions">
                <button
                  className="events-primary-action"
                  type="button"
                  onClick={scrollToContact}
                >
                  Hör av dig
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
                <button
                  className="events-secondary-action"
                  type="button"
                  onClick={scrollToPastEvents}
                >
                  Se tidigare evenemang
                </button>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}

export default HomeUpcomingEventsSection;
