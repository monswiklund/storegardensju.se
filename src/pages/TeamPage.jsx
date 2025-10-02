import FadeInSection from "../components/FadeInSection.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import PageSection from "../components/PageSection.jsx";
import ProfileShowcase from "../components/ProfileShowcase.jsx";
import { profiles } from "../data/profileData.js";

function TeamPage() {
    return (
        <main role="main" id="main-content">
            {/* Team */}
            <PageSection background="var(--background-alt)" spacing="default" ariaLabel="about-heading">
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
