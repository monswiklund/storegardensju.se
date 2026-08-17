import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeHeroSection,
  HomeServicesSection,
  HomeUpcomingEventsSection,
} from "../features/home";
import { PageSection, SectionDivider } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { fetchPublicEvents } from "../services/eventsService";
import { toUiEvent } from "../features/home/UpcomingEvents/toUiEvent.js";
import PastEventsAccordion from "../features/home/UpcomingEvents/components/PastEventsAccordion.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import { canonicalPath } from "../config/routes.js";

import { useSiteCopy } from "../hooks/usePageCopy.js";

function HomePage() {
  useSeo(seoMeta.home);
  const siteCopy = useSiteCopy();
  const navigate = useNavigate();
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

  const upcomingEvents = useMemo(() => {
    return [...eventsData.upcoming]
      .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0))
      .map(toUiEvent);
  }, [eventsData.upcoming]);

  const pastEvents = useMemo(() => {
    return [...eventsData.past]
      .sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0))
      .map(toUiEvent);
  }, [eventsData.past]);

  const scrollToGallery = () => {
    navigate(canonicalPath("/galleri"));
  };

  return (
    <div className="home-page">
      <header role="banner" id="home-hero">
        <PageSection background="alt" spacing="none" ariaLabel="hero-heading">
          <HomeHeroSection />
        </PageSection>
      </header>

      <SectionDivider above="alt" below="white" variant="wave" />

      <main role="main" id="main-content">
        {/* Kommande evenemang */}
        <div id="home-events">
          <PageSection
            background="white"
            spacing="compact"
            ariaLabel="evenemang-heading"
          >
            <FadeInSection>
              <HomeUpcomingEventsSection
                upcomingEvents={upcomingEvents}
                loading={loading}
                error={error}
              />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="white" below="alt" variant="hill" />

        {/* Tidigare evenemang */}
        <div id="past-events">
          <PageSection
            background="alt"
            spacing="compact"
            ariaLabel="tidigare-evenemang-heading"
          >
            <FadeInSection>
              <PastEventsAccordion events={pastEvents} />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="alt" below="green" variant="valley" />

        {/* Services - Klickbara kort */}
        <div id="home-services">
          <PageSection
            background="green"
            spacing="compact"
            ariaLabel="services-heading"
          >
            <FadeInSection>
              <HomeServicesSection />
            </FadeInSection>
          </PageSection>
        </div>

        <SectionDivider above="green" below="alt" variant="wave" />
      </main>
    </div>
  );
}

export default HomePage;
