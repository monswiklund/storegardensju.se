import { Suspense, lazy } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { PageSection, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import "./GalleriPage.css";
import usePageCopy from "../hooks/usePageCopy.js";

// Lazy load heavy components
const GalleryShowcase = lazy(() =>
  import("../features/gallery/ImageGallery/GalleryShowcase.jsx")
);

function GalleriPage() {
  useSeo(seoMeta.galleri);
  const copy = usePageCopy("gallery");
  return (
    <main role="main" id="main-content">
      {/* Full Gallery */}
      <PageSection
        background="alt"
        spacing="default"
        ariaLabel="gallery-page-heading"
      >
        <div className="gallery-page-intro" data-cms-hero data-cms-hero-content>
          <span className="section-eyebrow">{copy("hero.eyebrow")}</span>
          <h1 id="gallery-page-heading">{copy("hero.title")}</h1>
          <p>
            {copy("hero.lead")}
          </p>
          <Link to="/event/" className="gallery-page-intro__cta">
            {copy("hero.primary-cta")}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <ErrorBoundary>
          <Suspense
            fallback={
              <LoadingSpinner size="large" />
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
            cmsPage="gallery"
            title={copy("services-section.title")}
            eyebrow={copy("services-section.eyebrow")}
          />
        </PageSection>
      </div>

      <SectionDivider above="green" below="alt" variant="hill" />
    </main>
  );
}

export default GalleriPage;
