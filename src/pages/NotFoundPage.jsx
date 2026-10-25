import { useEffect } from "react";
import { ArrowUpRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import usePageCopy, { useSiteCopy } from "../hooks/usePageCopy";
import "./NotFoundPage.css";

// The main things people come for, labelled like the menu. Butik is left out while the menus
// hide it (the shop can be empty).
const MAIN_ROUTES = [
  { to: "/event/brollop/", label: "nav.wedding" },
  { to: "/event/", label: "nav.event" },
  { to: "/gruppdagar/", label: "nav.group-days" },
  { to: "/kurser/", label: "nav.courses" },
  { to: "/galleri/", label: "nav.gallery" },
];

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
    <main className="not-found-page" role="main" id="main-content" aria-labelledby="not-found-heading">
      <div className="not-found-page__inner">
        <span className="not-found-page__code" aria-hidden="true">404</span>
        <div className="not-found-page__ornament" aria-hidden="true">
          <span />
          <Compass size={20} />
          <span />
        </div>
        <h1 id="not-found-heading">{copy("hero.title")}</h1>
        <p>
          {copy("hero.lead")}
        </p>
        <div className="not-found-page__actions">
          <Link to="/" className="btn btn--primary">
            {siteCopy("nav.home")}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/kontakt/" className="btn btn--secondary">
            {siteCopy("nav.contact")}
          </Link>
        </div>
        <nav className="not-found-page__routes" aria-labelledby="not-found-routes-title">
          <h2 id="not-found-routes-title">{copy("hero.home-cta")}</h2>
          <ul>
            {MAIN_ROUTES.map((route) => (
              <li key={route.to}>
                <Link to={route.to}>{siteCopy(route.label)}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}

export default NotFoundPage;
