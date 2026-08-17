import { useState } from "react";
import { Link } from "react-router-dom";
import FadeInSection from "../components/ui/FadeInSection.jsx";
import ErrorBoundary from "../components/ui/ErrorBoundary.jsx";
import { ExploreMoreSection, PageSection } from "../components";
import { profiles } from "../data/profileData.js";
import { useSeo } from "../hooks/useSeo.js";
import { seoMeta } from "../config/seoMeta.js";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy.js";
import "./MansPortfolioPage.css";

function MansPortfolioPage() {
  useSeo(seoMeta.mansPortfolio || seoMeta.omOss);
  const copy = usePageCopy("portfolio-mans");
  const siteCopy = useSiteCopy();
  const profile = profiles.mans;
  const allLabel = siteCopy("cart.category-all") || "Alla";
  const [filter, setFilter] = useState("all");

  const allTags = profile.portfolio.flatMap((p) => p.tags || []);
  const uniqueTags = Array.from(new Set(allTags));

  const filteredProjects = filter === "all"
    ? profile.portfolio
    : profile.portfolio.filter((p) => p.tags && p.tags.includes(filter));

  return (
    <main role="main" id="main-content" className="mans-portfolio-page-minimal">
      <PageSection background="white" spacing="default">
        <ErrorBoundary>
          <FadeInSection>
            <div className="retro-wrapper">
              <nav className="retro-nav">
                <Link to="/om-oss/">&larr; {copy("hero.back-to-about")}</Link>
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
                <h2>{copy("hero.about-heading")}</h2>
                <p>
                  {copy("hero.about-body")}
                </p>
              </section>

              <section className="retro-section">
                <h2>{copy("hero.skills-heading")}</h2>
                <ul className="retro-list">
                  {profile.listItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <hr className="retro-hr" />

              <section className="retro-section">
                <h2>{copy("hero.projects-heading")}</h2>

                <div className="retro-filter">
                  <button
                    className={`retro-filter-btn ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    {allLabel}
                  </button>
                  {uniqueTags.map((tag) => (
                    <span key={tag}>
                      {" | "}
                      <button
                        className={`retro-filter-btn ${filter === tag ? "active" : ""}`}
                        onClick={() => setFilter(tag)}
                      >
                        {tag}
                      </button>
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
                          <em>{project.tags.join(", ")}</em>
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
        eyebrow={copy("explore.eyebrow")}
        title={copy("explore.title")}
        intro={copy("explore.body")}
        background="green"
        items={[
          {
            to: "/om-oss/",
            eyebrow: copy("explore.items.0.eyebrow"),
            title: copy("explore.items.0.title"),
            text: copy("explore.items.0.body"),
            featured: true,
          },
          {
            to: "/galleri/",
            eyebrow: copy("explore.items.1.eyebrow"),
            title: copy("explore.items.1.title"),
            text: copy("explore.items.1.body"),
          },
          {
            to: "/kontakt/",
            eyebrow: copy("explore.items.2.eyebrow"),
            title: copy("explore.items.2.title"),
            text: copy("explore.items.2.body"),
          },
        ]}
      />
    </main>
  );
}

export default MansPortfolioPage;
