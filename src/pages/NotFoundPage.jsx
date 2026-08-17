import { useEffect } from "react";
import { ArrowUpRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy";
import "./NotFoundPage.css";

function NotFoundPage() {
  const copy = usePageCopy("not-found");
  const siteCopy = useSiteCopy();

  useEffect(() => {
    const previousTitle = document.title;
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute("content");
    const createdRobotsMeta = !robotsMeta;
    const activeRobotsMeta =
      robotsMeta || document.head.appendChild(document.createElement("meta"));

    activeRobotsMeta.setAttribute("name", "robots");
    activeRobotsMeta.setAttribute("content", "noindex");
    if (copy("hero.page-title")) {
      document.title = copy("hero.page-title");
    }

    return () => {
      document.title = previousTitle;
      if (createdRobotsMeta) {
        activeRobotsMeta.remove();
      } else if (previousRobots) {
        activeRobotsMeta.setAttribute("content", previousRobots);
      } else {
        activeRobotsMeta.removeAttribute("content");
      }
    };
  }, [copy]);

  return (
    <main className="not-found-page" role="main" aria-labelledby="not-found-heading">
      <div className="not-found-page__inner">
        <span className="not-found-page__code">404</span>
        <div className="not-found-page__ornament" aria-hidden="true">
          <span />
          <Compass size={20} />
          <span />
        </div>
        <h1 id="not-found-heading">{copy("hero.title")}</h1>
        <p>
          {copy("hero.lead")}
        </p>
        <nav className="not-found-page__actions" aria-label={copy("hero.home-cta") || undefined}>
          <Link to="/" className="not-found-page__action not-found-page__action--primary">
            {siteCopy("nav.home")}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/event/" className="not-found-page__action">
            {siteCopy("nav.event")}
          </Link>
          <Link to="/kontakt/" className="not-found-page__action">
            {siteCopy("nav.contact")}
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default NotFoundPage;
