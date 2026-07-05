import { Users } from "lucide-react";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { PageSection } from "../components";
import TeamProfileShowcase from "../features/team/ProfileShowcase/TeamProfileShowcase.jsx";
import { profiles } from "../data/profileData.js";

function TeamPage() {
    return (
        <main role="main" id="main-content">
            {/* Team */}
            <PageSection background="alt" spacing="default" ariaLabel="about-heading">
                <ErrorBoundary>
                    <FadeInSection>
                        <div className="profile-showcase-container">
                            <span className="section-eyebrow">STOREGÅRDEN 7</span>
                            <div className="section-ornament align-left" aria-hidden="true">
                                <span className="section-ornament-line"></span>
                                <Users size={18} />
                                <span className="section-ornament-line"></span>
                            </div>
                            <h2 id="about-heading">Om Oss</h2>
                            <div className="team-grid">
                                <TeamProfileShowcase profile={profiles.ann} />
                                <TeamProfileShowcase profile={profiles.carl} />
                                <TeamProfileShowcase profile={profiles.lina} />
                                <TeamProfileShowcase profile={profiles.mans} />
                            </div>
                        </div>
                    </FadeInSection>
                </ErrorBoundary>
            </PageSection>
        </main>
    );
}

export default TeamPage;
