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
import {
  COURSE_LOCATION,
  allUpcomingPasses,
  passHref,
  trackById,
} from "../data/courseEvents.js";
import { seoMeta } from "../config/seoMeta.js";
import { canonicalPath } from "../config/routes.js";
import { COURSE_DAY_EVENT } from "../data/featuredPastEvents.js";

const isCourseDayEvent = (event) =>
  event?.id === COURSE_DAY_EVENT.id ||
  event?.startAt === COURSE_DAY_EVENT.startAt;

// Derived from the course hubs' own data rather than a second hardcoded copy:
// two literals describing the same pass drift apart the moment one is updated.
// Covers both tracks, so a maleri course shows up here too.
// Used only when /api/events is unreachable or returns nothing upcoming.
const courseFallbackEvents = () =>
  allUpcomingPasses().map((pass) => {
    const track = trackById(pass.primaryTrack);

    return {
      id: pass.id,
      title: `${pass.title} med ${track.instructor.name}`,
      spots: pass.price
        ? `${pass.price} kr / person${pass.dropIn ? " – Drop-in (Betalas på plats)" : ""}`
        : "",
      startAt: pass.startAt,
      endAt: pass.endAt,
      description: pass.description,
      artists: track.instructor.name,
      location: `${COURSE_LOCATION.name}, ${COURSE_LOCATION.locality} (Lidköping)`,
      links: [
        {
          // Anchor straight to the pass section on its own hub.
          href: passHref(pass, null),
          label: `Läs mer om ${track.hubLabel}`,
        },
      ],
      images: pass.images,
    };
  });

function HomePage() {
  useSeo(seoMeta.home);
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
        setEventsData({
          upcoming: courseFallbackEvents(),
          past: [],
        });
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
    const rawUpcoming =
      eventsData.upcoming.length > 0
        ? eventsData.upcoming
        : courseFallbackEvents();

    const fetched = rawUpcoming
      .filter((event) => !isCourseDayEvent(event))
      .sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0))
      .map(toUiEvent);

    const courseDayIsUpcoming =
      Date.now() < new Date(COURSE_DAY_EVENT.endAt).getTime();

    return courseDayIsUpcoming
      ? [toUiEvent(COURSE_DAY_EVENT), ...fetched]
      : fetched;
  }, [eventsData.upcoming]);

  const pastEvents = useMemo(() => {
    const fetched = eventsData.past
      .filter((event) => !isCourseDayEvent(event))
      .sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0))
      .map(toUiEvent);

    const courseDayIsPast =
      Date.now() >= new Date(COURSE_DAY_EVENT.endAt).getTime();

    return courseDayIsPast
      ? [toUiEvent(COURSE_DAY_EVENT), ...fetched]
      : fetched;
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
