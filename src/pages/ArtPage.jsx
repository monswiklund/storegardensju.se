import Creation from "../features/creation/Creation.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import PageSection from "../layout/PageSection/PageSection.jsx";

function ArtPage() {
    return (
        <main role="main" id="main-content">
            {/* Skapande sektion */}
            <PageSection background="white" spacing="default" ariaLabel="creation-heading">
                <FadeInSection>
                    <Creation/>
                </FadeInSection>
            </PageSection>
        </main>
    );
}

export default ArtPage;
