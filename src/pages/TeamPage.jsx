import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import PageSection from "../layout/PageSection/PageSection.jsx";
import ProfileShowcase from "../features/team/ProfileShowcase/ProfileShowcase.jsx";
import { profiles } from "../data/profileData.js";

function TeamPage() {
    return (
        <main role="main" id="main-content">
            {/* Team */}
            <PageSection background="alt" spacing="default" ariaLabel="about-heading">
                <ErrorBoundary>
                    <FadeInSection>
                        <div className="profile-showcase-container">
                            <h2 id="about-heading">Om Oss</h2>
                            <ProfileShowcase profile={profiles.ann} />
                            <ProfileShowcase profile={profiles.carl} />
                            <ProfileShowcase profile={profiles.lina} />
                            <ProfileShowcase profile={profiles.mans} />
                        </div>
                    </FadeInSection>
                </ErrorBoundary>
            </PageSection>
        </main>
    );
}

export default TeamPage;
