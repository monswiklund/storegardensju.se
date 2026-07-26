import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function activeSectionPath(items, currentPath) {
  return (
    items.find((item) => {
      const children = (item.children ?? []).filter((child) => !child.hidden);
      return (
        children.length > 0 &&
        (item.path === currentPath ||
          children.some((child) => child.path === currentPath))
      );
    })?.path ?? null
  );
}

function NavLinks({ items, currentPath, onNavigate }) {
  const [openSection, setOpenSection] = useState(() =>
    activeSectionPath(items, currentPath),
  );

  useEffect(() => {
    setOpenSection(activeSectionPath(items, currentPath));
  }, [items, currentPath]);

  return (
    <ul className="nav-list">
      {items.map((item) => {
        const children = (item.children ?? []).filter(
          (child) => !child.hidden,
        );
        const hasChildren = children.length > 0;
        const isChildActive = children.some(
          (child) => child.path === currentPath,
        );
        const isActive = currentPath === item.path;
        const isExpanded = hasChildren && openSection === item.path;
        const submenuId = `nav-submenu-${item.path.replace(/\W+/g, "-")}`;

        const handleParentClick = () => {
          onNavigate(item.path);
        };

        return (
          <li
            key={item.path}
            className={`nav-item ${hasChildren ? "has-submenu" : ""} ${
              isExpanded ? "submenu-open" : ""
            }`}
          >
            <div className="nav-item-row">
              <Link
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""} ${
                  isChildActive ? "section-active" : ""
                }`}
                onClick={handleParentClick}
              >
                <span className="nav-link-label">{item.label}</span>
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  className="nav-submenu-toggle"
                  aria-label={`Visa undersidor för ${item.label}`}
                  aria-expanded={isExpanded}
                  aria-controls={submenuId}
                  onClick={() =>
                    setOpenSection((current) =>
                      current === item.path ? null : item.path,
                    )
                  }
                >
                  <span className="nav-submenu-caret" aria-hidden="true" />
                </button>
              )}
            </div>
            {hasChildren && (
              <ul
                id={submenuId}
                className="nav-submenu"
                aria-label={`${item.label} undermeny`}
              >
                {children.map((child) => (
                  <li key={child.path} className="nav-submenu-item">
                    <Link
                      to={child.path}
                      className={`nav-sublink ${
                        currentPath === child.path ? "active" : ""
                      }`}
                      onClick={() => onNavigate(child.path)}
                    >
                      <span className="nav-link-label">{child.label}</span>
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
