import { Users } from "lucide-react";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { PageSection, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import { ContactSection } from "../features/contact";
import TeamProfileShowcase from "../features/team/ProfileShowcase/TeamProfileShowcase.jsx";
import { profiles } from "../data/profileData.js";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";

function TeamPage() {
    useSeo(seoMeta.omOss);
    return (
        <main role="main" id="main-content">
            {/* Team */}
            <PageSection background="white" spacing="default" ariaLabel="about-heading">
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

            <SectionDivider above="white" below="alt" variant="hill" />

            {/* Kontakta oss */}
            <FadeInSection rootMargin="0px 0px 20% 0px" threshold={0.1}>
              <ContactSection />
            </FadeInSection>

            <SectionDivider above="alt" below="white" variant="wave" />

            {/* Andra erbjudanden */}
            <div id="team-services-recommendation">
              <PageSection background="white" spacing="default">
                <FadeInSection>
                  <HomeServicesSection
                    excludeId="om-platsen"
                    title="Upptäck mer på gården"
                    eyebrow="MER ATT SE & GÖRA"
                  />
                </FadeInSection>
              </PageSection>
            </div>

            <SectionDivider above="white" below="green" variant="wave" />
        </main>
    );
}

export default TeamPage;
