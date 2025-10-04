import { Suspense, lazy } from 'react';
import OldAboutUs from "../components/home/OldAboutUs/OldAboutUs.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import PageSection from "../components/sections/PageSection/PageSection.jsx";

// Lazy load heavy components
const ImageGallery = lazy(() => import('../components/gallery/ImageGallery/ImageGallery.jsx'));

function GalleriPage() {
    return (
        <main role="main" id="main-content">
            {/* Om lokalen */}
            <PageSection background="alt" spacing="compact" ariaLabel="welcome-heading">
                <FadeInSection>
                    <OldAboutUs/>
                </FadeInSection>
            </PageSection>

            {/* Full Gallery */}
            <PageSection background="white" spacing="default" ariaLabel="gallery-heading">
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
