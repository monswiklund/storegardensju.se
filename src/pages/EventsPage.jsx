import { HomeUpcomingEventsSection } from "../features/home";
import { PageSection, SectionDivider } from "../components";
import PastEventsAccordion from "../features/home/UpcomingEvents/components/PastEventsAccordion.jsx";
import { seoMeta } from "../config/seoMeta.js";
import usePublicEvents from "../hooks/usePublicEvents.js";
import { useSeo } from "../hooks/useSeo.js";
import "./EventsPage.css";

// The heading and lead are the pre-rendered page's text too, so they live in one place.
const { h1, paragraphs } = seoMeta.evenemang.staticContent;

/** Every event on the farm in one place: what is coming first, then what has been. */
function EventsPage() {
  useSeo(seoMeta.evenemang);
  const { upcomingEvents, pastEvents, loading, error } = usePublicEvents();

  return (
    <main id="main-content" className="events-page">
      <PageSection background="alt" spacing="none" ariaLabelledBy="events-page-title">
        <header className="events-page__head">
          <h1 id="events-page-title">{h1}</h1>
          <p>{paragraphs[0]}</p>
        </header>
      </PageSection>

      <div id="home-events">
        <PageSection background="alt" spacing="compact" ariaLabel="evenemang-heading">
          <HomeUpcomingEventsSection upcomingEvents={upcomingEvents} loading={loading} error={error} />
        </PageSection>
      </div>

      {pastEvents.length > 0 && (
        <>
          <SectionDivider above="alt" below="green" variant="valley" />
          <div id="past-events">
            <PageSection background="green" spacing="compact" ariaLabel="tidigare-evenemang-heading">
              <PastEventsAccordion events={pastEvents} />
            </PageSection>
          </div>
          <SectionDivider above="green" below="alt" variant="wave" />
        </>
      )}
    </main>
  );
}

export default EventsPage;
