import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function NavLinks({ items, currentPath, onNavigate }) {
  const isMobileNav = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  return (
    <ul className="nav-list">
      {items.map((item) => {
        const children = (item.children ?? []).filter(
          (child) => !child.hidden,
        );
        const hasChildren = children.length > 0;
        const isMobile = isMobileNav();
        const submenuItems =
          hasChildren && isMobile
            ? [{ path: item.path, label: `${item.label}` }, ...children]
            : children;
        const isChildActive = children.some(
          (child) => child.path === currentPath,
        );
        const isActive = currentPath === item.path || isChildActive;

        const handleParentClick = () => {
          if (hasChildren && isMobile) {
            onNavigate(item.path);
            return;
          }
          onNavigate(item.path);
        };

        return (
          <li
            key={item.path}
            className={`nav-item ${hasChildren ? "has-submenu" : ""}`}
          >
            <div className="nav-item-row">
              <Link
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={handleParentClick}
              >
                {item.label}
              </Link>
            </div>
            {hasChildren && (
              <ul className="nav-submenu" aria-label={`${item.label} undermeny`}>
                {submenuItems.map((child) => (
                  <li key={child.path} className="nav-submenu-item">
                    <Link
                      to={child.path}
                      className={`nav-sublink ${
                        currentPath === child.path ? "active" : ""
                      }`}
                      onClick={() => onNavigate(child.path)}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
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
