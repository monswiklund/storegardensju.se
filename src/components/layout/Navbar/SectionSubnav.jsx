import { Link, useLocation } from "react-router-dom";
import {
  appRoutes,
  canonicalPath,
  normalizePath,
} from "../../../config/routes.js";
import HomeSubnav from "./HomeSubnav.jsx";

// Desktop hides the navbar dropdowns (see .nav-submenu in Navbar.css), so a
// child route is only reachable from this bar. It used to be hardcoded to the
// Event section, which left /konst - the maleri & keramik hub - without a
// desktop link anywhere except the footer. Now any top-level route with
// children gets the same bar when you are inside its section.
//
// Class names stay event-subnav-*: the markup is unchanged and App.jsx toggles
// body.event-subnav-active for the page offset.

/** The top-level route whose section `pathname` belongs to, or null. */
export function sectionForPath(pathname) {
  const path = normalizePath(pathname);

  return (
    appRoutes.find((route) => {
      const children = (route.children ?? []).filter((child) => !child.hidden);
      if (children.length === 0) return false;
      return (
        route.path === path || children.some((child) => child.path === path)
      );
    }) || null
  );
}

function SectionSubnav() {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);

  if (currentPath === "/") {
    return <HomeSubnav />;
  }

  const section = sectionForPath(currentPath);

  if (!section) {
    return null;
  }

  // The parent section is already available in the main navigation directly
  // above this bar, so repeating it here weakens the hierarchy. The subnav is
  // reserved for the section's child pages.
  const links = (section.children ?? []).filter((child) => !child.hidden);

  return (
    <div
      className="event-subnav active"
      role="navigation"
      aria-label={`${section.label} undernavigering`}
    >
      <div className="event-subnav-inner">
        {links.map((link) => (
          <Link
            key={link.path}
            to={canonicalPath(link.path)}
            className={`event-subnav-link ${
              currentPath === link.path ? "active" : ""
            }`}
          >
            {link.subnavLabel ?? link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SectionSubnav;
