import { useNavigate } from 'react-router-dom';
import Hero from "../features/home/Hero/Hero.jsx";
import FeaturedGallery from "../features/home/FeaturedGallery/FeaturedGallery.jsx";
import Services from "../features/home/Services/Services.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import PageSection from "../layout/PageSection/PageSection.jsx";
import UpcomingEvents from "../features/home/UpcomingEvents/UpcomingEvents.jsx";
import VenueIntro from "../features/venue/VenueIntro/VenueIntro.jsx";

function HomePage() {
    const navigate = useNavigate();

    const scrollToGallery = () => {
        navigate('/galleri');
    };

    return (
        <>
            <header role="banner">
                <PageSection background="white" spacing="none" ariaLabel="hero-heading">
                    <FadeInSection>
                        <Hero/>
                    </FadeInSection>
                </PageSection>
            </header>

            <main role="main" id="main-content">
                {/* Featured Images Grid */}
                <PageSection background="white" spacing="compact" ariaLabel="featured-gallery-heading">
                    <FadeInSection>
                        <FeaturedGallery onViewAll={scrollToGallery} />
                    </FadeInSection>
                </PageSection>

                {/* Services - Klickbara kort */}
                <PageSection background="white" spacing="compact" ariaLabel="services-heading">
                    <FadeInSection>
                        <Services/>
                    </FadeInSection>
                </PageSection>

                {/* Kommande evenemang */}
                <PageSection background="alt" spacing="compact" ariaLabel="evenemang-heading">
                    <FadeInSection>
                        <UpcomingEvents/>
                    </FadeInSection>
                </PageSection>

                {/* Venue intro */}
                <PageSection background="white" spacing="compact" ariaLabel="venue-intro-heading">
                    <FadeInSection>
                        <VenueIntro />
                    </FadeInSection>
                </PageSection>

            </main>
        </>
    );
}

export default HomePage;
