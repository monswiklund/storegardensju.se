import { Users } from "lucide-react";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { PageSection } from "../components";
import { HomeServicesSection } from "../features/home";
import { ContactSection } from "../features/contact";
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

            {/* Kontakta oss */}
            <FadeInSection rootMargin="0px 0px 20% 0px" threshold={0.1}>
              <ContactSection />
            </FadeInSection>

            {/* Andra erbjudanden */}
            <div id="team-services-recommendation">
              <PageSection background="green" spacing="default">
                <FadeInSection>
                  <HomeServicesSection
                    excludeId="om-platsen"
                    title="Upptäck mer på gården"
                    eyebrow="MER ATT SE & GÖRA"
                  />
                </FadeInSection>
              </PageSection>
            </div>
        </main>
    );
}

export default TeamPage;
