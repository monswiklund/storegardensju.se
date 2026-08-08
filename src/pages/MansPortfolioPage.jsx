import { useState } from "react";
import { Link } from "react-router-dom";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { ExploreMoreSection, PageSection } from "../components";
import { profiles } from "../data/profileData.js";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import "./MansPortfolioPage.css";

function MansPortfolioPage() {
  useSeo(seoMeta.mansPortfolio || seoMeta.omOss);
  const profile = profiles.mans;
  const [filter, setFilter] = useState("Alla");

  const allTags = ["Alla", ...new Set(profile.portfolio.flatMap((p) => p.tags || []))];

  const filteredProjects = filter === "Alla"
    ? profile.portfolio
    : profile.portfolio.filter((p) => p.tags && p.tags.includes(filter));

  return (
    <main role="main" id="main-content" className="mans-portfolio-page-minimal">
      <PageSection background="white" spacing="default">
        <ErrorBoundary>
          <FadeInSection>
            <div className="retro-wrapper">
              <nav className="retro-nav">
                <Link to="/om-oss/">&larr; Tillbaka till Om Oss</Link>
              </nav>

              <hr className="retro-hr" />

              <header className="retro-header">
                <h1>{profile.title}</h1>
                <p className="retro-subtitle">{profile.about}</p>
                <address className="retro-contact">
                  E-post: <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a> | 
                  GitHub: <a href={`https://${profile.contact.github}`} target="_blank" rel="noreferrer">github.com/monswiklund</a> | 
                  LinkedIn: <a href={`https://${profile.contact.linkedin}`} target="_blank" rel="noreferrer">linkedin.com/in/monswiklund</a>
                </address>
              </header>

              <hr className="retro-hr" />

              <section className="retro-section">
                <h2>Om mig</h2>
                <p>
                  Junior Fullstack- & DevOps-utvecklare. Arbetar med Go, C# (.NET Core), SvelteKit, React / React Native, TypeScript, Postgres, SQLite samt moln- & containerinfrastruktur.
                </p>
              </section>

              <section className="retro-section">
                <h2>Kompetensområden</h2>
                <ul className="retro-list">
                  {profile.listItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <hr className="retro-hr" />

              <section className="retro-section">
                <h2>Utvalda Projekt</h2>

                <div className="retro-filter">
                  Filtrera:{" "}
                  {allTags.map((tag, i) => (
                    <span key={tag}>
                      <button
                        className={`retro-filter-btn ${filter === tag ? "active" : ""}`}
                        onClick={() => setFilter(tag)}
                      >
                        {tag}
                      </button>
                      {i < allTags.length - 1 ? " | " : ""}
                    </span>
                  ))}
                </div>

                <div className="retro-projects-list">
                  {filteredProjects.map((project, idx) => (
                    <article key={idx} className="retro-project-item">
                      <h3>{project.title}</h3>
                      <p>{project.caption}</p>
                      {project.tags && (
                        <p className="retro-tags">
                          <em>Tekniker: {project.tags.join(", ")}</em>
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <hr className="retro-hr" />

              <footer className="retro-footer">
                <p><small>&copy; {new Date().getFullYear()} Måns Wiklund &mdash; Storegården 7</small></p>
              </footer>
            </div>
          </FadeInSection>
        </ErrorBoundary>
      </PageSection>

      <ExploreMoreSection
        id="portfolio-explore-more"
        eyebrow="NÄSTA STEG"
        title="Utforska mer på Storegården 7"
        intro="Fortsätt till den del av sajten som passar dig bäst – lär känna gården, se miljöerna eller hör av dig."
        background="green"
        items={[
          {
            to: "/om-oss/",
            eyebrow: "Storegården 7",
            title: "Tillbaka till Om oss",
            text: "Lär känna gården och människorna bakom verksamheten.",
            featured: true,
          },
          {
            to: "/galleri/",
            eyebrow: "Se platsen",
            title: "Bildgalleri",
            text: "Upptäck ladan, loftet och ateljén på nära håll.",
          },
          {
            to: "/kontakt/",
            eyebrow: "Prata med oss",
            title: "Kontakt",
            text: "Skicka en fråga eller berätta vad du vill planera.",
          },
        ]}
      />
    </main>
  );
}

export default MansPortfolioPage;
