import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar
} from "lucide-react";
import "./UpcomingEvents.css";
import EventCard from "./components/EventCard";
import useScrollToSelector from "../../../hooks/useScrollToSelector";
import { canonicalPath } from "../../../config/routes.js";

// Helper component to render either react-router Link or standard anchor tag
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

function HomeUpcomingEventsSection({ upcomingEvents = [], loading = false, error = "" }) {
  const scrollToContact = useScrollToSelector(".contact-container");
  const scrollToPastEvents = useScrollToSelector("#past-events");
  const [isCentered, setIsCentered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const section = document.getElementById("events-section");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;

      // Section is considered centered when its center is close to viewport center (within 250px)
      const distance = Math.abs(sectionCenter - viewportCenter);
      setIsCentered(distance < 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeEvent = upcomingEvents[activeIndex] || upcomingEvents[0] || null;
  const primaryLink = activeEvent?.links?.[0] || { href: "/kurser/yoga", label: "Läs mer & anmäl dig" };

  return (
    <div id="events-section" className={`events-section ${isCentered ? "is-centered" : ""}`}>
      {/* Background Botanical Vines with Rich Flowers for Entire Component */}
      <svg
        className="section-botanical-vine section-vine-left"
        viewBox="-40 -20 240 380"
        aria-hidden="true"
      >
        <path
          d="M 10,320 Q 70,220 90,140 T 170,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Secondary branch line */}
        <path
          d="M 55,200 Q 15,160 30,120"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Leaf details */}
        <path d="M 45,240 Q 25,220 20,228 C 18,238 38,246 45,240 Z" fill="currentColor" />
        <path d="M 78,165 Q 55,148 48,158 C 46,168 64,175 78,165 Z" fill="currentColor" />
        <path d="M 118,82 Q 102,62 92,72 C 90,84 108,90 118,82 Z" fill="currentColor" />

        {/* 6-Petal Flower 1 (Large - Bottom Left) */}
        <g transform="translate(38, 270) scale(0.65)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 2 (Medium - Mid-lower) */}
        <g transform="translate(62, 195) scale(0.48)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 3 (Branch Flower - Left cluster) */}
        <g transform="translate(28, 120) scale(0.45)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 4 (Medium - Center) */}
        <g transform="translate(95, 125) scale(0.55)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 5 (Small - Upper stem) */}
        <g transform="translate(132, 75) scale(0.42)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 6 (Small - Top Tip) */}
        <g transform="translate(162, 38) scale(0.38)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>
      </svg>

      {/* 3rd Flower Cluster SVG (Top-Center / Interstitial placement) */}
      <svg
        className="section-botanical-vine section-vine-center"
        viewBox="-40 -20 200 280"
        aria-hidden="true"
      >
        <path
          d="M 10,240 Q 80,180 100,100 T 150,10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M 50,180 Q 30,160 25,168 C 23,178 43,186 50,180 Z" fill="currentColor" />
        <path d="M 85,120 Q 65,102 58,112 C 56,122 74,130 85,120 Z" fill="currentColor" />

        {/* 6-Petal Flower 1 */}
        <g transform="translate(45, 200) scale(0.55)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 2 */}
        <g transform="translate(95, 95) scale(0.48)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 3 */}
        <g transform="translate(142, 20) scale(0.38)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>
      </svg>
      <svg
        className="section-botanical-vine section-vine-right"
        viewBox="-40 -20 240 380"
        aria-hidden="true"
      >
        <path
          d="M 180,30 Q 110,120 90,200 T 10,340"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Secondary branch line */}
        <path
          d="M 125,140 Q 165,180 150,220"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Leaf details */}
        <path d="M 125,100 Q 145,120 150,112 C 152,102 132,94 125,100 Z" fill="currentColor" />
        <path d="M 98,175 Q 120,192 128,182 C 130,172 112,165 98,175 Z" fill="currentColor" />

        {/* 6-Petal Flower 1 (Large - Top Right) */}
        <g transform="translate(145, 60) scale(0.65)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 2 (Medium - Upper mid) */}
        <g transform="translate(118, 135) scale(0.48)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 3 (Branch Flower - Right cluster) */}
        <g transform="translate(150, 220) scale(0.45)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 4 (Medium - Center Right) */}
        <g transform="translate(75, 220) scale(0.55)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 5 (Small - Lower mid) */}
        <g transform="translate(45, 275) scale(0.42)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>

        {/* 6-Petal Flower 6 (Small - Bottom Right Tip) */}
        <g transform="translate(22, 320) scale(0.38)" fill="currentColor">
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(60)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(120)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(180)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(240)" />
          <path d="M 0,-24 C -6,-24 -10,-14 0,-4 C 10,-14 6,-24 0,-24 Z" transform="rotate(300)" />
          <circle cx="0" cy="-4" r="5" fill="#ffffff" />
        </g>
      </svg>

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
                <h2 className="events-heading-large">Kommande tillfällen</h2>
                <p className="events-description-large">
                  Här hittar du kommande kurser, öppna ateljékvällar och andra
                  aktiviteter på gården.
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
                {upcomingEvents.length > 1 && (
                  <div className="upcoming-date-tabs-bar">
                    <span className="upcoming-date-tabs-label">Välj datum:</span>
                    <div className="upcoming-date-tabs-list">
                      {upcomingEvents.map((evt, idx) => {
                        const parts = (evt.date || "").split(" ");
                        const dayStr = parts[0] || `${idx + 1}`;
                        const monthStr = parts[1] ? parts[1].slice(0, 3) : "aug";
                        return (
                          <button
                            key={evt.id || idx}
                            type="button"
                            className={`upcoming-date-chip ${idx === activeIndex ? "is-active" : ""}`}
                            onClick={() => setActiveIndex(idx)}
                          >
                            {dayStr} {monthStr}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {activeEvent && (
                  <div className="upcoming-event-carousel">
                    <EventCard event={activeEvent} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="events-empty-panel">
              <span className="events-empty-kicker">Just nu</span>
              <h2>Inget nytt datum än.</h2>
              <p>
                Det går fortfarande att fråga om en privat workshop eller
                gruppdag.
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
