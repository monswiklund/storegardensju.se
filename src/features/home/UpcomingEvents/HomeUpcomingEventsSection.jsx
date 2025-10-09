import { useState } from "react";
import "./UpcomingEvents.css";
import "../PastEvents/PastEvents.css";
import { upcomingEvents, pastEvents as pastEventsData } from "../../../data/homeContent.js";
import EventCard from "./components/EventCard";
import InfoCallout from "./components/InfoCallout";
import PastEventsAccordion from "./components/PastEventsAccordion";
import useScrollToSelector from "../../../hooks/useScrollToSelector";

function HomeUpcomingEventsSection() {
  const [showPast, setShowPast] = useState(false);
  const scrollToContact = useScrollToSelector(".contact-container");

  return (
    <div id="events-section" className="events-section">
      <div className="events-container">
        <h2 id="events-heading">Kommande evenemang</h2>
        <p className="events-intro">
          Upptäck våra kommande workshops, kurser och evenemang. Boka din plats redan idag!
        </p>

        <div className="events-grid">
          {upcomingEvents.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>

        <InfoCallout onContact={scrollToContact} />

        <PastEventsAccordion
          isOpen={showPast}
          onToggle={() => setShowPast((value) => !value)}
          events={pastEventsData}
        />
      </div>
    </div>
  );
}

export default HomeUpcomingEventsSection;
