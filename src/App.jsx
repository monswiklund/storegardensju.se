// Komplett App-struktur med alla komponenter

// App.jsx
import { Suspense, lazy, useRef } from 'react';
import VälkomstText from "./components/VälkomstText.jsx";
import VälkomstBild from "./components/VälkomstBild.jsx";
import Kontakt from "./components/Kontakt.jsx";
import ValueProposition from "./components/ValueProposition.jsx";
import FeaturedGallery from "./components/FeaturedGallery.jsx";
import Services from "./components/Services.jsx";
import Skapande from "./components/Skapande.jsx";
import KommandeEvenemang from "./components/KommandeEvenemang.jsx";
import EventFest from "./components/EventFest.jsx";
import Navbar from "./components/Navbar.jsx";
import FadeInSection from "./components/FadeInSection.jsx";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import BuildInfo from "./components/BuildInfo.jsx";

// Lazy load heavy components
const ImageGallery = lazy(() => import('./components/ImageGallery.jsx'));
const Vilka = lazy(() => import('./components/Vilka.jsx'));

function App() {
    const galleryRef = useRef(null);

    const scrollToGallery = () => {
        galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <Navbar />
            <a href="#main-content" className="skip-link">Hoppa till huvudinnehåll</a>
            <header role="banner">
                <section aria-labelledby="hero-heading">
                    <FadeInSection>
                        <VälkomstBild/>
                    </FadeInSection>
                </section>
            </header>

            <main role="main" id="main-content">

                {/* Featured Images Grid */}
                <FadeInSection>
                    <FeaturedGallery onViewAll={scrollToGallery} />
                </FadeInSection>

                {/* Value Proposition - 3 pelare */}
                <FadeInSection>
                    <ValueProposition/>
                </FadeInSection>

                {/* Services - Klickbara kort */}
                <FadeInSection>
                    <Services/>
                </FadeInSection>

                {/* Event & Fest */}
                <FadeInSection>
                    <EventFest/>
                </FadeInSection>

                {/* Skapande sektion */}
                <FadeInSection>
                    <Skapande/>
                </FadeInSection>

                {/* Kommande evenemang */}
                <FadeInSection>
                    <KommandeEvenemang/>
                </FadeInSection>

                {/* Om lokalen */}
                <section aria-labelledby="welcome-heading" style={{background: 'var(--background-alt)', padding: '32px 20px 80px'}}>
                    <FadeInSection>
                        <VälkomstText/>
                    </FadeInSection>
                </section>

                {/* Full Gallery */}
                <section aria-labelledby="gallery-heading" ref={galleryRef} style={{background: 'white', padding: '80px 20px'}}>
                    <ErrorBoundary>
                        <FadeInSection>
                            <Suspense fallback={<LoadingSpinner size="large" text="Laddar bildgalleri..." />}>
                                <ImageGallery/>
                            </Suspense>
                        </FadeInSection>
                    </ErrorBoundary>
                </section>

                {/* Team */}
                <section aria-labelledby="about-heading" style={{background: 'var(--background-alt)', padding: '80px 20px'}}>
                    <ErrorBoundary>
                        <FadeInSection>
                            <Suspense fallback={<LoadingSpinner size="medium" text="Laddar teamet..." />}>
                                <Vilka/>
                            </Suspense>
                        </FadeInSection>
                    </ErrorBoundary>
                </section>

                {/* Contact */}
                <section aria-labelledby="contact-heading" style={{background: 'linear-gradient(135deg, var(--background-warm) 0%, var(--background-alt) 100%)', padding: '100px 20px'}}>
                    <FadeInSection>
                        <Kontakt/>
                    </FadeInSection>
                </section>
            </main>

            <footer role="contentinfo" className="site-footer">
                <BuildInfo />
            </footer>

            <ScrollToTopButton/>
        </>
    );
}

export default App;