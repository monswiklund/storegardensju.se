import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { canonicalPath, normalizePath } from "../../../config/routes.js";
import usePageCopy from "../../../hooks/usePageCopy.js";
import { getCurrentTitle } from "../Navbar/Navbar.jsx";
import "./Breadcrumbs.css";

// Sub-pages and the section they sit in. Top-level pages show none: the menu already marks them.
const PARENTS = {
  "/event/brollop": "/event",
  "/gruppdagar": "/event",
  "/kurser/yoga": "/kurser",
  "/kurser/konst": "/kurser",
  "/ann/keramik": "/ann",
  "/om-oss/portfolj/mans": "/om-oss",
};

const parentPath = (path) =>
  PARENTS[path] ?? ["/butik", "/evenemang"].find((section) => path.startsWith(`${section}/`)) ?? null;

/**
 * The trail from Hem to the page shown, for a sub-page. `current` names a page the menu does not
 * know (an event, a product). Null on a top-level page.
 */
export function breadcrumbTrail(pathname, copy, { current } = {}) {
  const path = normalizePath(pathname);
  const up = parentPath(path);
  if (!up) return null;
  return {
    links: [
      { to: "/", label: getCurrentTitle("/", copy) },
      { to: up, label: getCurrentTitle(up, copy) },
    ],
    current: current || getCurrentTitle(path, copy),
  };
}

/** One component for every sub-page; each page places it where its own heading starts. */
function Breadcrumbs({ current, tone = "dark", className = "" }) {
  const copy = usePageCopy("site");
  const { pathname } = useLocation();
  const trail = breadcrumbTrail(pathname, copy, { current });
  if (!trail) return null;

  return (
    <nav className={`breadcrumbs breadcrumbs--${tone} ${className}`.trim()} aria-label="Brödsmulor">
      <ol>
        {trail.links.map((link) => (
          <li key={link.to}>
            <Link to={canonicalPath(link.to)}>{link.label}</Link>
          </li>
        ))}
        <li aria-current="page">{trail.current}</li>
      </ol>
    </nav>
  );
}

Breadcrumbs.propTypes = {
  current: PropTypes.string,
  // "light" over a photo, "dark" on the page's own background.
  tone: PropTypes.oneOf(["dark", "light"]),
  className: PropTypes.string,
};

export default Breadcrumbs;
