import { Suspense, lazy } from "react";
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
          <Suspense
            fallback={
              <LoadingSpinner size="large" text="Laddar bildgalleri..." />
            }
          >
            <GalleryShowcase />
          </Suspense>
        </ErrorBoundary>
      </PageSection>

      <SectionDivider above="alt" below="green" variant="wave" />

      {/* Erbjudanden */}
      <div id="gallery-services-recommendation">
        <PageSection background="green" spacing="default">
          <HomeServicesSection
            title="Upptäck mer på gården"
            eyebrow="BOKA & BESÖK"
          />
        </PageSection>
      </div>

      <SectionDivider above="green" below="alt" variant="hill" />
    </main>
  );
}

export default GalleriPage;
