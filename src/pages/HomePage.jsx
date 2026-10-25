import { useEffect, useState, useMemo } from "react";
import {
  HomeHeroSection,
  HomeUpcomingEventsSection,
} from "../features/home";
import { PageSection, SectionDivider, ExploreMore } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { fetchPublicEvents } from "../services/eventsService";
import { toUiEvent } from "../features/home/UpcomingEvents/toUiEvent.js";
import PastEventsAccordion from "../features/home/UpcomingEvents/components/PastEventsAccordion.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";

import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";

// Who the home page sends where: one card per reason to visit.
const AUDIENCE_IDS = ["brollop", "event", "gruppdagar", "kurser-konst", "yoga"];

function HomePage() {
  useSeo(seoMeta.home);
  const siteCopy = useSiteCopy();
  const homeCopy = usePageCopy("home");
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
        setEventsData({ upcoming: data.upcoming, past: data.past });
        // Neither the CMS nor this build's export had a calendar: say so instead of "nothing planned".
        if (data.source === "none") setError(siteCopy("ui.events-fetch-error"));
      } catch {
        if (!active) return;
        setEventsData({ upcoming: [], past: [] });
        setError(siteCopy("ui.events-fetch-error"));
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
  }, [siteCopy]);

  // sortAt is a course's next session (its last once it is over), so a running course is filed
  // by when it meets next, not by the day it began.
  const upcomingEvents = useMemo(() => {
    return eventsData.upcoming
      .map((event) => toUiEvent(event))
      .sort((a, b) => new Date(a.sortAt || 0) - new Date(b.sortAt || 0));
  }, [eventsData.upcoming]);

  const pastEvents = useMemo(() => {
    // A cancelled event never took place, so it is no memory to show.
    return eventsData.past
      .filter((event) => event.status !== "cancelled")
      .map((event) => toUiEvent(event))
      .sort((a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0));
  }, [eventsData.past]);

  return (
    <div className="home-page">
      <header role="banner" id="home-hero">
        <PageSection background="alt" spacing="none" ariaLabel="hero-heading">
          <HomeHeroSection />
        </PageSection>
      </header>

      <SectionDivider above="alt" below="white" variant="wave" />
      <main id="main-content">
        <div id="home-services">
          <ExploreMore
            ids={AUDIENCE_IDS}
            limit={AUDIENCE_IDS.length}
            eyebrow={homeCopy("services-section.eyebrow")}
            title={homeCopy("services-section.title")}
            headingId="services-heading"
            showMeta
          />
        </div>

        {/* An empty calendar block only said "nothing yet"; it shows once there is a date. */}
        {upcomingEvents.length > 0 && (
          <>
            <SectionDivider above="white" below="alt" variant="hill" />
            <div id="home-events">
              <PageSection background="alt" spacing="compact" ariaLabel="evenemang-heading">
                <HomeUpcomingEventsSection
                  upcomingEvents={upcomingEvents}
                  loading={loading}
                  error={error}
                />
              </PageSection>
            </div>
          </>
        )}

        {pastEvents.length > 0 && (
          <>
            <SectionDivider
              above={upcomingEvents.length > 0 ? "alt" : "white"}
              below="green"
              variant="valley"
            />
            <div id="past-events">
              <PageSection background="green" spacing="compact" ariaLabel="tidigare-evenemang-heading">
                <FadeInSection>
                  <PastEventsAccordion events={pastEvents} />
                </FadeInSection>
              </PageSection>
            </div>
            <SectionDivider above="green" below="alt" variant="wave" />
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
