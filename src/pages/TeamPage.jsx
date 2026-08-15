import { useState, useEffect } from "react";
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
import { fetchTeamMembers } from "../services/cmsService.js";

function TeamPage() {
  useSeo(seoMeta.omOss);
  const copy = usePageCopy("about");
  const [teamList, setTeamList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetchTeamMembers()
      .then((members) => {
        if (isMounted && Array.isArray(members) && members.length > 0) {
          setTeamList(members);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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
              {copy(
                "hero.lead",
                "Lär känna människorna bakom Storegården 7 och hur vi tar hand om våra gäster, grupper och samarbeten.",
              )}
            </p>
            <div className="team-page-actions">
              <Link to="/kontakt/" className="team-page-action team-page-action--primary">
                {copy("hero.primary-cta", "Kontakta oss")}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/event/" className="team-page-action team-page-action--secondary">
                Se våra event
              </Link>
            </div>
            <div className="team-grid">
              {teamList.length > 0 ? (
                teamList.map((m) => {
                  const slug = m.slug || m.name?.toLowerCase().split(" ")[0] || "ann";
                  const fallback = profiles[slug] || {};
                  const imageSrc = m.image?.url
                    ? m.image.url
                    : (m.imageUrl || fallback.imageSrc);

                  const profileData = {
                    title: m.name || fallback.title,
                    about: m.role || fallback.about,
                    texts: m.bio?.trim() ? [m.bio] : [],
                    listItems: Array.isArray(m.skills) ? m.skills.map((s) => s.label) : fallback.listItems,
                    imageSrc,
                    contact: {
                      email: m.email || fallback.contact?.email,
                      instagram: m.instagram || fallback.contact?.instagram,
                    },
                    portfolioUrl: m.portfolioUrl || fallback.portfolioUrl,
                    portfolio: fallback.portfolio || [],
                  };

                  return <TeamProfileShowcase key={m.id || slug} profile={profileData} />;
                })
              ) : (
                <>
                  <TeamProfileShowcase profile={profiles.ann} />
                  <TeamProfileShowcase profile={profiles.carl} />
                  <TeamProfileShowcase profile={profiles.lina} />
                  <TeamProfileShowcase profile={profiles.mans} />
                </>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </PageSection>

      <SectionDivider above="white" below="alt" variant="hill" />

      {/* Kontakta oss */}
      <ContactSection />

      <SectionDivider above="alt" below="white" variant="wave" />

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
