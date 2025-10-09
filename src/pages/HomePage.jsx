import { useNavigate } from 'react-router-dom';
import { HomeHeroSection, HomeFeaturedGallery, HomeServicesSection, HomeUpcomingEventsSection } from "../features/home";
import { PageSection } from "../components";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import VenueIntroSection from "../features/venue/VenueIntro/VenueIntroSection.jsx";

function HomePage() {
    const navigate = useNavigate();

    const scrollToGallery = () => {
        navigate('/galleri');
    };

    return (
        <>
            <header role="banner">
                <PageSection background="white" spacing="none" ariaLabel="hero-heading">
                    <HomeHeroSection/>
                </PageSection>
            </header>

            <main role="main" id="main-content">
                {/* Featured Images Grid */}
                <PageSection background="white" spacing="compact" ariaLabel="featured-gallery-heading">
                    <FadeInSection>
                        <HomeFeaturedGallery onViewAll={scrollToGallery} />
                    </FadeInSection>
                </PageSection>

                {/* Services - Klickbara kort */}
                <PageSection background="white" spacing="compact" ariaLabel="services-heading">
                    <FadeInSection>
                        <HomeServicesSection/>
                    </FadeInSection>
                </PageSection>

                {/* Kommande evenemang */}
                <PageSection background="alt" spacing="compact" ariaLabel="evenemang-heading">
                    <FadeInSection>
                        <HomeUpcomingEventsSection/>
                    </FadeInSection>
                </PageSection>

                {/* Venue intro */}
                <PageSection background="white" spacing="compact" ariaLabel="venue-intro-heading">
                    <FadeInSection>
                        <VenueIntroSection />
                    </FadeInSection>
                </PageSection>

            </main>
        </>
    );
}

export default HomePage;
