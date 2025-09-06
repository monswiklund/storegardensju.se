// Komplett App-struktur med alla komponenter

// App.jsx
import { Suspense, lazy, useEffect } from 'react';
import VälkomstText from "./components/VälkomstText.jsx";
import VälkomstBild from "./components/VälkomstBild.jsx";
import Kontakt from "./components/Kontakt.jsx";
import FadeInSection from "./components/FadeInSection.jsx";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import BuildInfo from "./components/BuildInfo.jsx";

// Lazy load heavy components
const ImageGallery = lazy(() => import('./components/ImageGallery.jsx'));
const Vilka = lazy(() => import('./components/Vilka.jsx'));

function App() {
    return (
        <>
            <a href="#main-content" className="skip-link">Hoppa till huvudinnehåll</a>
            <header role="banner">
                <section aria-labelledby="hero-heading">
                    <FadeInSection>
                        <VälkomstBild/>
                    </FadeInSection>
                </section>
            </header>
            
            <main role="main" id="main-content">
                <section aria-labelledby="gallery-heading">
                    <ErrorBoundary>
                        <FadeInSection>
                            <Suspense fallback={<LoadingSpinner size="large" text="Laddar bildgalleri..." />}>
                                <ImageGallery/>
                            </Suspense>
                        </FadeInSection>
                    </ErrorBoundary>
                </section>
                
                <section aria-labelledby="welcome-heading">
                    <FadeInSection>
                        <VälkomstText/>
                    </FadeInSection>
                </section>
                
                <section aria-labelledby="contact-heading">
                    <FadeInSection>
                        <Kontakt/>
                    </FadeInSection>
                </section>
                
                <section aria-labelledby="about-heading">
                    <ErrorBoundary>
                        <FadeInSection>
                            <Suspense fallback={<LoadingSpinner size="medium" text="Laddar teamet..." />}>
                                <Vilka/>
                            </Suspense>
                        </FadeInSection>
                    </ErrorBoundary>
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