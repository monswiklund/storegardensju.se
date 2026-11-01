import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { canonicalPath, routeLabel } from "../../../config/routes.js";

// The phone menu lists every subpage under its section, so nothing hides behind a toggle;
// desktop hides them and uses the section bar instead (see .nav-submenu in Navbar.css).
function NavLinks({ items, currentPath, onNavigate, copy }) {
  return (
    <ul className="nav-list">
      {items.map((item, index) => {
        const itemLabel = routeLabel(item, copy);
        const children = (item.children ?? []).filter(
          (child) => !child.hidden,
        );
        const hasChildren = children.length > 0;
        const isChildActive = children.some(
          (child) => child.path === currentPath,
        );
        const isActive = currentPath === item.path;

        return (
          <li
            key={item.path}
            style={{ "--i": index }}
            className={`nav-item${hasChildren ? " has-submenu" : ""}${item.cta ? " nav-item--cta" : ""}${item.path === "/" ? " nav-item--home" : ""}`}
          >
            <div className="nav-item-row">
              <Link
                to={canonicalPath(item.path)}
                className={`nav-link ${isActive ? "active" : ""} ${
                  isChildActive ? "section-active" : ""
                } ${item.cta ? "nav-link--cta" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(item.path)}
              >
                <span className="nav-link-label">{itemLabel}</span>
              </Link>
            </div>
            {hasChildren && (
              <div className="nav-submenu-wrapper">
                <ul className="nav-submenu" aria-label={itemLabel || undefined}>
                  {children.map((child, childIndex) => (
                    <li
                      key={child.path}
                      style={{ "--sub-i": childIndex }}
                      className="nav-submenu-item"
                    >
                      <Link
                        to={canonicalPath(child.path)}
                        className={`nav-sublink ${
                          currentPath === child.path ? "active" : ""
                        }`}
                        aria-current={currentPath === child.path ? "page" : undefined}
                        onClick={() => onNavigate(child.path)}
                      >
                        <span className="nav-link-label">{routeLabel(child, copy)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

NavLinks.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          path: PropTypes.string.isRequired,
          hidden: PropTypes.bool,
        }),
      ),
    }),
  ).isRequired,
  currentPath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default NavLinks;
