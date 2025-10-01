import { Suspense, lazy } from 'react';
import VälkomstText from "../components/VälkomstText.jsx";
import FadeInSection from "../components/FadeInSection.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageSection from "../components/PageSection.jsx";

// Lazy load heavy components
const ImageGallery = lazy(() => import('../components/ImageGallery.jsx'));

function GalleriPage() {
    return (
        <main role="main" id="main-content">
            {/* Om lokalen */}
            <PageSection background="var(--background-alt)" padding="32px 20px 80px" ariaLabel="welcome-heading">
                <FadeInSection>
                    <VälkomstText/>
                </FadeInSection>
            </PageSection>

            {/* Full Gallery */}
            <PageSection background="white" ariaLabel="gallery-heading">
                <ErrorBoundary>
                    <FadeInSection>
                        <Suspense fallback={<LoadingSpinner size="large" text="Laddar bildgalleri..." />}>
                            <ImageGallery/>
                        </Suspense>
                    </FadeInSection>
                </ErrorBoundary>
            </PageSection>

        </main>
    );
}

export default GalleriPage;
