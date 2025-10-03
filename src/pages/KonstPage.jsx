import Skapande from "../components/sections/Skapande/Skapande.jsx";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import PageSection from "../components/sections/PageSection/PageSection.jsx";

function KonstPage() {
    return (
        <main role="main" id="main-content">
            {/* Skapande sektion */}
            <PageSection background="white" spacing="default" ariaLabel="skapande-heading">
                <FadeInSection>
                    <Skapande/>
                </FadeInSection>
            </PageSection>
        </main>
    );
}

export default KonstPage;
