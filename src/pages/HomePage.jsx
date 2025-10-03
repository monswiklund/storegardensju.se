import { useNavigate } from 'react-router-dom';
import WelcomeImage from "../components/hero/WelcomeImage.jsx";
import FeaturedGallery from "../components/gallery/FeaturedGallery/FeaturedGallery.jsx";
import Services from "../components/sections/Services/Services.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import PageSection from "../components/sections/PageSection/PageSection.jsx";
import UpcomingEvents from "../components/events/UpcomingEvents.jsx";

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
                        <WelcomeImage/>
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

            </main>
        </>
    );
}

export default HomePage;
