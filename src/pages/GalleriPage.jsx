import { Suspense, lazy } from "react";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { PageSection, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";

// Lazy load heavy components
const GalleryShowcase = lazy(() =>
  import("../features/gallery/ImageGallery/GalleryShowcase.jsx")
);

function GalleriPage() {
  useSeo(seoMeta.galleri);
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

      <SectionDivider above="alt" below="green" variant="wave" />

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

      <SectionDivider above="green" below="alt" variant="hill" />
    </main>
  );
}

export default GalleriPage;