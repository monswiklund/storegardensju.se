import PropTypes from "prop-types";
import { ADMIN_VIEW_OPTIONS } from "../adminConstants";

function AdminSidebar({ adminView, onViewChange }) {
  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar-header">
        <h2>Admin</h2>
        <p>Hantera butiken</p>
      </div>
      <nav className="admin-sidebar-nav">
        {ADMIN_VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`admin-sidebar-link ${
              adminView === option.value ? "active" : ""
            }`}
            onClick={() => onViewChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

AdminSidebar.propTypes = {
  adminView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default AdminSidebar;
