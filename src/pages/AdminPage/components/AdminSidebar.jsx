import PropTypes from "prop-types";
import { ADMIN_VIEW_GROUPS } from "../adminConstants";

function AdminSidebar({ adminView, onViewChange, isOpen, onClose }) {
  return (
    <>
      <div 
        className={`admin-sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`} aria-label="Admin navigation">
        <div className="admin-sidebar-header">
          <div>
            <h2>Admin</h2>
            <p>Hantera butiken</p>
          </div>
          <button className="admin-sidebar-close" onClick={onClose} aria-label="Stäng meny">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="admin-sidebar-groups">
          {ADMIN_VIEW_GROUPS.map((group) => (
            <div key={group.title} className="admin-sidebar-group">
              <h3 className="admin-sidebar-group-title">{group.title}</h3>
              <nav className="admin-sidebar-nav">
                {group.options.map((option) => (
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
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

AdminSidebar.propTypes = {
  adminView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default AdminSidebar;
