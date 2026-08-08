import { useEffect } from "react";
import { ArrowUpRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute("content");
    const createdRobotsMeta = !robotsMeta;
    const activeRobotsMeta =
      robotsMeta || document.head.appendChild(document.createElement("meta"));

    activeRobotsMeta.setAttribute("name", "robots");
    activeRobotsMeta.setAttribute("content", "noindex");
    document.title = "Sidan hittades inte | Storegården 7";

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
  }, []);

  return (
    <main className="not-found-page" role="main" aria-labelledby="not-found-heading">
      <div className="not-found-page__inner">
        <span className="not-found-page__code">404</span>
        <div className="not-found-page__ornament" aria-hidden="true">
          <span />
          <Compass size={20} />
          <span />
        </div>
        <h1 id="not-found-heading">Sidan hittades inte</h1>
        <p>
          Det verkar som att sidan har flyttat eller att länken inte längre
          finns. Du hittar enkelt vidare härifrån.
        </p>
        <nav className="not-found-page__actions" aria-label="Hitta vidare på Storegården 7">
          <Link to="/" className="not-found-page__action not-found-page__action--primary">
            Till startsidan
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/event/" className="not-found-page__action">
            Se våra event
          </Link>
          <Link to="/kontakt/" className="not-found-page__action">
            Kontakta oss
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default NotFoundPage;
