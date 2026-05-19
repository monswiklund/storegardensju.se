import { useEffect, useMemo, useState } from "react";
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

function HomeUpcomingEventsSection() {
  const scrollToContact = useScrollToSelector(".contact-container");
  const scrollToPastEvents = useScrollToSelector("#past-events");
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

  return (
    <div id="events-section" className="events-section">
      <div className="events-container">
        <header className="events-section-header">
          <span className="events-eyebrow">Ateljén och gården</span>
          <h2 id="events-heading">Kommande evenemang</h2>
        </header>

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

        {!loading && !error &&
          (upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <EventCard key={`${event.title}-${event.date}-${event.time}`} event={event} />
              ))}
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
          ))}


        <PastEventsAccordion events={pastEvents} />
      </div>
    </div>
  );
}

export default HomeUpcomingEventsSection;
