import Skapande from "../components/Skapande.jsx";
import FadeInSection from "../components/FadeInSection.jsx";
import PageSection from "../components/PageSection.jsx";

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
