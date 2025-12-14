import CreativeWorkshopsSection from "../features/creation/CreativeWorkshopsSection.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import { PageSection } from "../components";

function ArtPage() {
  return (
    <main role="main" id="main-content">
      {/* Skapande sektion */}
      <PageSection
        background="alt"
        spacing="default"
        ariaLabel="creation-heading"
      >
        <FadeInSection>
          <CreativeWorkshopsSection />
        </FadeInSection>
      </PageSection>
    </main>
  );
}

export default ArtPage;
