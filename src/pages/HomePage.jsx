import { useNavigate } from 'react-router-dom';
import VälkomstBild from "../components/VälkomstBild.jsx";
import FeaturedGallery from "../components/FeaturedGallery.jsx";
import Services from "../components/Services.jsx";
import FadeInSection from "../components/FadeInSection.jsx";
import PageSection from "../components/PageSection.jsx";
import KommandeEvenemang from "../components/KommandeEvenemang.jsx";

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
                        <VälkomstBild/>
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
                <PageSection background="var(--background-alt)" spacing="compact" ariaLabel="evenemang-heading">
                    <FadeInSection>
                        <KommandeEvenemang/>
                    </FadeInSection>
                </PageSection>

            </main>
        </>
    );
}

export default HomePage;
