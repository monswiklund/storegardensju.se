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
          <span className="section-eyebrow">{copy("hero.eyebrow", "SE PLATSEN")}</span>
          <h1 id="gallery-page-heading">{copy("hero.title", "Bildgalleri")}</h1>
          <p>
            Se ladan, loftet och ateljén inför ert nästa event, besök eller
            kurs på Storegården 7.
          </p>
          <Link to="/event/" className="gallery-page-intro__cta">
            Planera ett event
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
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
            cmsPage="gallery"
            title={copy("services-section.title", "Utforska mer")}
            eyebrow={copy("services-section.eyebrow", "BOKA & BESÖK")}
          />
        </PageSection>
      </div>

      <SectionDivider above="green" below="alt" variant="hill" />
    </main>
  );
}

export default GalleriPage;
