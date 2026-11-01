import {
  HomeHeroSection,
  HomeUpcomingEventsSection,
} from "../features/home";
import { PageSection, SectionDivider, ExploreMore } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import PastEventsAccordion from "../features/home/UpcomingEvents/components/PastEventsAccordion.jsx";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";

import usePageCopy from "../hooks/usePageCopy.js";
import usePublicEvents from "../hooks/usePublicEvents.js";

// Who the home page sends where: one card per reason to visit.
const AUDIENCE_IDS = ["brollop", "event", "gruppdagar", "kurser-konst", "yoga"];

function HomePage() {
  useSeo(seoMeta.home);
  const homeCopy = usePageCopy("home");
  const { upcomingEvents, pastEvents, loading, error } = usePublicEvents();

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
