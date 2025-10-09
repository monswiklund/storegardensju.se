import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function NavLinks({ items, currentPath, onNavigate }) {
  return (
    <ul className="nav-list">
      {items.map((item) => (
        <li key={item.path} className="nav-item">
          <Link
            to={item.path}
            className={`nav-link ${currentPath === item.path ? "active" : ""}`}
            onClick={() => onNavigate(item.path)}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

NavLinks.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ).isRequired,
  currentPath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default NavLinks;
