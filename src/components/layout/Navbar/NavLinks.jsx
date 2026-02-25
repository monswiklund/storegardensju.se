import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function NavLinks({ items, currentPath, onNavigate }) {
  const [openSubmenus, setOpenSubmenus] = useState({});

  const activeSubmenus = useMemo(() => {
    const next = {};
    items.forEach((item) => {
      const children = item.children ?? [];
      if (
        item.path === currentPath ||
        children.some((child) => child.path === currentPath)
      ) {
        next[item.path] = true;
      }
    });
    return next;
  }, [items, currentPath]);

  useEffect(() => {
    if (!isMobileNav()) return;
    if (Object.keys(activeSubmenus).length === 0) return;
    setOpenSubmenus((prev) => ({ ...prev, ...activeSubmenus }));
  }, [activeSubmenus]);

  const isMobileNav = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const toggleSubmenu = (path) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

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
        const isOpen = Boolean(openSubmenus[item.path]);

        const handleParentClick = (event) => {
          if (hasChildren && isMobile) {
            event.preventDefault();
            toggleSubmenu(item.path);
            return;
          }
          onNavigate(item.path);
        };

        return (
          <li
            key={item.path}
            className={`nav-item ${hasChildren ? "has-submenu" : ""} ${
              isOpen ? "submenu-open" : ""
            }`}
          >
            <div className="nav-item-row">
              <Link
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={handleParentClick}
              >
                {item.label}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  className="nav-submenu-toggle"
                  aria-label={`Visa ${item.label} undermeny`}
                  aria-expanded={isOpen}
                  onClick={() => toggleSubmenu(item.path)}
                >
                  <span className="nav-submenu-caret" aria-hidden="true" />
                </button>
              )}
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
