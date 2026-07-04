import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Leaf,
  Coffee,
  Users
} from "lucide-react";
import "./UpcomingEvents.css";
import "../PastEvents/PastEvents.css";
import EventCard from "./components/EventCard";
import PastEventsAccordion from "./components/PastEventsAccordion";
import useScrollToSelector from "../../../hooks/useScrollToSelector";
import { fetchPublicEvents } from "../../../services/eventsService";

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

const toUiEvent = (item) => {
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

function HomeUpcomingEventsSection() {
  const scrollToContact = useScrollToSelector(".contact-container");
  const scrollToPastEvents = useScrollToSelector("#past-events");
  const [eventsData, setEventsData] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUpcomingIndex, setCurrentUpcomingIndex] = useState(0);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPublicEvents();
        if (!active) return;
        setEventsData({
          upcoming: Array.isArray(data?.upcoming) ? data.upcoming : [],
          past: Array.isArray(data?.past) ? data.past : [],
        });
      } catch {
        if (!active) return;
        setError("Kunde inte hämta evenemang just nu.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    run();

    return () => {
      active = false;
    };
  }, []);

  const upcomingEvents = useMemo(() => {
    const fetched = eventsData.upcoming
      .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0))
      .map(toUiEvent);

    const staticYogaEvent = {
      title: "Heldag med yoga & måleri",
      spots: "Passar alla",
      date: "13 Juli 2026",
      time: "10:00 - 17:30",
      description: "En stämningsfull heldag fylld med återhämtning och skaparglädje på vackra Storegården 7. Mjukt yogapass med Lina Wiklund på förmiddagen, god lunch på gården, och glädjefylld målarkurs med Ann Wiklund på eftermiddagen.",
      location: "Storegården 7",
      links: [
        {
          href: "/kurser",
          label: "Läs mer & anmäl dig",
        }
      ],
      image: {
        src: "/images/evenemang/yoga-loft.png",
        alt: "Yoga på loftet"
      }
    };

    return [staticYogaEvent, ...fetched];
  }, [eventsData.upcoming]);

  const pastEvents = useMemo(
    () => eventsData.past
      .sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0))
      .map(toUiEvent),
    [eventsData.past]
  );

  const activeEvent = upcomingEvents[currentUpcomingIndex] || null;
  const primaryLink = activeEvent?.links?.[0] || { href: "/kurser", label: "Läs mer & anmäl dig" };
  const secondaryLink = activeEvent?.links?.[1] || { href: "/event", label: "Mer information" };

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
                <h2 className="events-heading-large">Nästa grej på Storegården</h2>
                <p className="events-description-large">
                  En dag för kropp, sinne och kreativitet i en inspirerande miljö.
                  Välkommen till en stämningsfull retreat med yoga, måleri och god mat.
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
              <div className="events-empty-date" aria-hidden="true">
                <span>Nästa</span>
                <strong>snart</strong>
              </div>
              <div className="events-empty-content">
                <span className="events-empty-kicker">Inga datum ligger ute just nu</span>
                <h3>Vill du samla en grupp i ateljén?</h3>
                <p>
                  Vi släpper nya tillfällen när kalendern tillåter. Det går
                  också att höra av sig om privat workshop, gruppbokning eller
                  en egen dag på gården.
                </p>
                <div className="events-empty-actions">
                  <button
                    className="events-primary-action"
                    type="button"
                    onClick={scrollToContact}
                  >
                    Kontakta oss
                  </button>
                  <button
                    className="events-secondary-action"
                    type="button"
                    onClick={scrollToPastEvents}
                  >
                    Se tidigare kvällar
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Separator line */}
        <div className="events-section-separator" />

        {/* Past Events Section */}
        <PastEventsAccordion events={pastEvents} />

      </div>
    </div>
  );
}

export default HomeUpcomingEventsSection;
