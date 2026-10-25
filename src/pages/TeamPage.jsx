import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { ExploreMore, PageSection, SectionDivider } from "../components";
import { ContactSection } from "../features/contact";
import TeamProfileShowcase from "../features/team/ProfileShowcase/TeamProfileShowcase.jsx";
import { profiles } from "../data/profileData.js";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import "./TeamPage.css";
import usePageCopy from "../hooks/usePageCopy.js";
import { fetchTeamMembers } from "../services/cmsService.js";
import { resolveMediaUrl } from "../services/mediaService.js";

// Måns built the site but is not one of the hosts; his portfolio route stays, off the team grid.
const HIDDEN_FROM_TEAM = new Set(["mans"]);

// CMS slug, or the first name without diacritics ("Måns" -> "mans") to match profileData's keys.
const memberSlug = (member) =>
  member.slug ||
  member.name
    ?.split(" ")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() ||
  "";

const FALLBACK_TEAM = [profiles.ann, profiles.carl, profiles.lina];

/** A CMS team member as a card profile, with profileData.js filling what the CMS leaves empty. */
const toProfile = (member) => {
  const slug = memberSlug(member);
  const fallback = profiles[slug] || {};
  return {
    key: member.id || slug,
    title: member.name || fallback.title,
    about: member.role || fallback.about,
    texts: member.bio?.trim() ? [member.bio] : fallback.texts || [],
    listItems: Array.isArray(member.skills)
      ? member.skills.map((skill) => skill.label)
      : fallback.listItems,
    imageSrc: resolveMediaUrl(member.image, "thumbnail"),
    contact: {
      email: member.email || fallback.contact?.email,
      instagram: member.instagram || fallback.contact?.instagram,
    },
    portfolioUrl: member.portfolioUrl || fallback.portfolioUrl,
    portfolio: fallback.portfolio || [],
  };
};

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

  const members = teamList
    .filter((member) => !HIDDEN_FROM_TEAM.has(memberSlug(member)))
    .map(toProfile);

  return (
    <main role="main" id="main-content">
      {/* Team */}
      <PageSection background="white" spacing="default" ariaLabelledBy="about-heading">
        <ErrorBoundary>
          <div className="profile-showcase-container">
            <div className="team-page-hero" data-cms-hero data-cms-hero-content>
              <span className="section-eyebrow">{copy("hero.eyebrow")}</span>
            <div className="section-ornament align-left" aria-hidden="true">
              <span className="section-ornament-line"></span>
              <Users size={18} />
              <span className="section-ornament-line"></span>
            </div>
            <h1 id="about-heading">{copy("hero.title")}</h1>
            <p className="team-page-intro">
              {copy("hero.lead")}
            </p>
            <div className="team-page-actions" data-cms-hero-actions>
              <Link to="/kontakt/" className="btn btn--primary">
                {copy("hero.primary-cta")}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/event/" className="btn btn--secondary">
                {copy("hero.secondary-cta")}
              </Link>
            </div>
            </div>
            <h2 className="visually-hidden">{copy("team.title")}</h2>
            <div className="team-grid">
              {(members.length > 0 ? members : FALLBACK_TEAM).map((profile) => (
                <TeamProfileShowcase key={profile.key || profile.title} profile={profile} />
              ))}
            </div>
          </div>
        </ErrorBoundary>
      </PageSection>

      <SectionDivider above="white" below="green" variant="wave" />

      <ExploreMore background="green" />

      <SectionDivider above="green" below="alt" variant="hill" />

      {/* Kontakta oss: App leaves its own form out on /om-oss, so this is the page's one form. */}
      <ContactSection />
    </main>
  );
}

export default TeamPage;
