import { Suspense, lazy } from "react";
import VenueIntroSection from "../features/venue/VenueIntro/VenueIntroSection.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { PageSection } from "../components";

// Lazy load heavy components
const GalleryShowcase = lazy(() =>
  import("../features/gallery/ImageGallery/GalleryShowcase.jsx")
);

function GalleriPage() {
  return (
    <main role="main" id="main-content">
      {/* Full Gallery */}
      <PageSection
        background="alt"
        spacing="default"
        ariaLabel="gallery-heading"
      >
        <ErrorBoundary>
          <FadeInSection>
            <Suspense
              fallback={
                <LoadingSpinner size="large" text="Laddar bildgalleri..." />
              }
            >
              <GalleryShowcase />
            </Suspense>
          </FadeInSection>
        </ErrorBoundary>
      </PageSection>
      {/* Om lokalen */}
      <PageSection
        background="alt"
        spacing="compact"
        ariaLabel="venue-intro-heading"
      >
        <FadeInSection>
          <VenueIntroSection />
        </FadeInSection>
      </PageSection>
    </main>
  );
}

export default GalleriPage;