import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { PageSection, SectionDivider } from "../components";
import { HomeServicesSection } from "../features/home";
import { ContactSection } from "../features/contact";
import TeamProfileShowcase from "../features/team/ProfileShowcase/TeamProfileShowcase.jsx";
import { profiles } from "../data/profileData.js";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import "./TeamPage.css";
import usePageCopy from "../hooks/usePageCopy.js";

function TeamPage() {
    useSeo(seoMeta.omOss);
    const copy = usePageCopy("about");
    return (
        <main role="main" id="main-content">
            {/* Team */}
            <PageSection background="white" spacing="default" ariaLabel="about-heading">
                <ErrorBoundary>
                    <div className="profile-showcase-container">
                        <span className="section-eyebrow">{copy("hero.eyebrow", "STOREGÅRDEN 7")}</span>
                        <div className="section-ornament align-left" aria-hidden="true">
                            <span className="section-ornament-line"></span>
                            <Users size={18} />
                            <span className="section-ornament-line"></span>
                        </div>
                        <h1 id="about-heading">{copy("hero.title", "Om oss")}</h1>
                        <p className="team-page-intro">
                            Lär känna människorna bakom Storegården 7 och få en
                            känsla för hur vi tar hand om våra gäster, grupper
                            och samarbeten.
                        </p>
                        <div className="team-page-actions">
                            <Link to="/kontakt/" className="team-page-action team-page-action--primary">
                                Kontakta oss
                                <ArrowUpRight size={18} aria-hidden="true" />
                            </Link>
                            <Link to="/event/" className="team-page-action team-page-action--secondary">
                                Se våra event
                            </Link>
                        </div>
                        <div className="team-grid">
                            <TeamProfileShowcase cmsId="ann" profile={profiles.ann} />
                            <TeamProfileShowcase cmsId="carl" profile={profiles.carl} />
                            <TeamProfileShowcase cmsId="lina" profile={profiles.lina} />
                            <TeamProfileShowcase cmsId="mans" profile={profiles.mans} />
                        </div>
                    </div>
                </ErrorBoundary>
            </PageSection>

            <SectionDivider above="white" below="alt" variant="hill" />

            {/* Kontakta oss */}
            <ContactSection />

            <SectionDivider above="alt" below="white" variant="wave" />

            {/* Andra erbjudanden */}
            <div id="team-services-recommendation">
              <PageSection background="white" spacing="default">
                <HomeServicesSection
                  cmsPage="about"
                  title={copy("services-section.title", "Utforska mer")}
                  eyebrow={copy("services-section.eyebrow", "MER ATT SE & GÖRA")}
                />
              </PageSection>
            </div>

            <SectionDivider above="white" below="green" variant="wave" />
        </main>
    );
}

export default TeamPage;
