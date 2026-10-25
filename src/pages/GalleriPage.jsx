import { Suspense, lazy } from "react";
import { ArrowDown } from "lucide-react";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { ExploreMore, PageSection, SectionDivider } from "../components";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import { smoothScrollTo } from "../utils/scrollUtils.js";
import "./GalleriPage.css";
import usePageCopy from "../hooks/usePageCopy.js";

// Lazy load heavy components
const GalleryShowcase = lazy(() =>
  import("../features/gallery/ImageGallery/GalleryShowcase.jsx")
);

const SCROLL_OFFSET = 96;

// Moves both the view and keyboard focus, so a screen reader continues from the target.
const scrollAndFocus = (selector) => {
  smoothScrollTo(selector, SCROLL_OFFSET);
  const target = document.querySelector(selector);
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
};

function GalleriPage() {
  useSeo(seoMeta.galleri);
  const copy = usePageCopy("gallery");

  const showImages = (event) => {
    event.preventDefault();
    scrollAndFocus("#gallery-heading");
  };

  // The enquiry form follows this page (App renders it after <main>).
  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("expand-contact-form"));
    scrollAndFocus("#contact-heading");
  };

  return (
    <main role="main" id="main-content">
      {/* Full Gallery */}
      <PageSection
        background="alt"
        spacing="default"
        ariaLabelledBy="gallery-page-heading"
      >
        <div className="gallery-page-intro" data-cms-hero data-cms-hero-content>
          <span className="section-eyebrow">{copy("hero.eyebrow")}</span>
          <h1 id="gallery-page-heading">{copy("hero.title")}</h1>
          <p>
            {copy("hero.lead")}
          </p>
          <a
            href="#gallery-heading"
            className="btn btn--primary gallery-page-intro__cta"
            onClick={showImages}
          >
            {copy("hero.primary-cta")}
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </div>
        <ErrorBoundary>
          <Suspense
            fallback={
              <LoadingSpinner size="large" />
            }
          >
            <GalleryShowcase
              title={copy("showcase.title")}
              lead={copy("showcase.lead")}
            />
          </Suspense>
        </ErrorBoundary>

        <section className="gallery-plan" aria-labelledby="gallery-plan-title">
          <h2 id="gallery-plan-title" className="gallery-plan__title">
            {copy("plan.title")}
          </h2>
          <p className="gallery-plan__text">{copy("plan.body")}</p>
          <button type="button" className="btn btn--primary" onClick={openEnquiry}>
            {copy("plan.cta")}
            <ArrowDown size={18} aria-hidden="true" />
          </button>
        </section>
      </PageSection>

      <SectionDivider above="alt" below="white" variant="wave" />

      <ExploreMore />

      <SectionDivider above="white" below="alt" variant="hill" />
    </main>
  );
}

export default GalleriPage;
