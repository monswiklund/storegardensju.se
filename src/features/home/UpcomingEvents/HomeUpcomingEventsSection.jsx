import { useEffect, useMemo, useState } from "react";
import "./UpcomingEvents.css";
import "../PastEvents/PastEvents.css";
import EventCard from "./components/EventCard";
import InfoCallout from "./components/InfoCallout";
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

function HomeUpcomingEventsSection() {
  const scrollToContact = useScrollToSelector(".contact-container");
  const [eventsData, setEventsData] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const upcomingEvents = useMemo(
    () => eventsData.upcoming
      .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0))
      .map(toUiEvent),
    [eventsData.upcoming]
  );

  const pastEvents = useMemo(
    () => eventsData.past
      .sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0))
      .map(toUiEvent),
    [eventsData.past]
  );

  return (
    <div id="events-section" className="events-section">
      <div className="events-container">
        <h2 id="events-heading">Kommande evenemang</h2>
        <p className="events-intro">
          Upptäck våra kommande workshops, kurser och evenemang. Boka din plats
          redan idag!
        </p>

        {loading && (
          <div className="events-placeholder">
            <p>Hämtar evenemang...</p>
          </div>
        )}

        {!loading && error && (
          <div className="events-placeholder">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error &&
          (upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <EventCard key={`${event.title}-${event.date}-${event.time}`} event={event} />
              ))}
            </div>
          ) : (
            <div className="events-placeholder">
              <p>Inga evenemang planerade just nu.</p>
              <p>
                Håll utkik för kommande evenemang eller kontakta oss för att boka
                din egen workshop!
              </p>
            </div>
          ))}

        <InfoCallout onContact={scrollToContact} />

        <PastEventsAccordion events={pastEvents} />
      </div>
    </div>
  );
}

export default HomeUpcomingEventsSection;
