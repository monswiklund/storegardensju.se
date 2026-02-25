import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { appRoutes } from "../../../config/routes.js";

function EventSubnav({ isActive }) {
  const location = useLocation();
  const eventRoute = appRoutes.find((route) => route.path === "/event");
  const children = (eventRoute?.children ?? []).filter(
    (child) => !child.hidden,
  );

  if (!eventRoute || children.length === 0) {
    return null;
  }

  const links = [eventRoute, ...children];

  return (
    <div
      className={`event-subnav ${isActive ? "active" : ""}`}
      role="navigation"
      aria-label="Event navigation"
    >
      <div className="event-subnav-inner">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`event-subnav-link ${
              location.pathname === link.path ? "active" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

EventSubnav.propTypes = {
  isActive: PropTypes.bool,
};

EventSubnav.defaultProps = {
  isActive: false,
};

export default EventSubnav;
