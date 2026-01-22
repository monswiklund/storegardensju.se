import { useNavigate } from "react-router-dom";
import {
  HomeHeroSection,
  HomeFeaturedGallery,
  HomeServicesSection,
  HomeUpcomingEventsSection,
} from "../features/home";
import { PageSection } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import VenueIntroSection from "../features/venue/VenueIntro/VenueIntroSection.jsx";

function HomePage() {
  const navigate = useNavigate();

  const scrollToGallery = () => {
    navigate("/galleri");
  };

  return (
    <>
      <header role="banner">
        <PageSection background="alt" spacing="none" ariaLabel="hero-heading">
          <HomeHeroSection />
        </PageSection>
      </header>

      <main role="main" id="main-content">
        {/* Kommande evenemang */}
        <PageSection
          background="alt"
          spacing="compact"
          ariaLabel="evenemang-heading"
        >
          <FadeInSection>
            <HomeUpcomingEventsSection />
          </FadeInSection>
        </PageSection>

        {/* Featured Images Grid */}
        <PageSection
          background="alt"
          spacing="compact"
          ariaLabel="featured-gallery-heading"
        >
          <FadeInSection>
            <HomeFeaturedGallery onViewAll={scrollToGallery} />
          </FadeInSection>
        </PageSection>

        {/* Services - Klickbara kort */}
        <PageSection
          background="alt"
          spacing="compact"
          ariaLabel="services-heading"
        >
          <FadeInSection>
            <HomeServicesSection />
          </FadeInSection>
        </PageSection>
      </main>
    </>
  );
}

export default HomePage;
