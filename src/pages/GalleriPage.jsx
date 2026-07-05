import { Suspense, lazy } from "react";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { PageSection } from "../components";
import { HomeServicesSection } from "../features/home";

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

      {/* Erbjudanden */}
      <div id="gallery-services-recommendation">
        <PageSection background="green" spacing="default">
          <FadeInSection>
            <HomeServicesSection
              title="Upptäck mer på gården"
              eyebrow="BOKA & BESÖK"
            />
          </FadeInSection>
        </PageSection>
      </div>
    </main>
  );
}

export default GalleriPage;