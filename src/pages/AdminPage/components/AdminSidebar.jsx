import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  GalleryHorizontal,
  House,
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  ShoppingBag,
  Tags,
  UsersRound,
  X,
} from "lucide-react";
import { ADMIN_VIEW_GROUPS } from "../adminConstants";

const NAV_ICONS = {
  overview: LayoutDashboard,
  orders: ReceiptText,
  customers: UsersRound,
  products: Package,
  events: CalendarDays,
  gallery: GalleryHorizontal,
  coupons: Tags,
  stats: BarChart3,
};

function AdminSidebar({
  adminView,
  onViewChange,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapsed,
}) {
  const closeButtonRef = useRef(null);
  const restoreFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    restoreFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    document.body.classList.add("admin-sidebar-drawer-open");

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("admin-sidebar-drawer-open");
      restoreFocusRef.current?.focus?.();
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div 
        className={`admin-sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`admin-sidebar ${isOpen ? "open" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <img
              className="admin-sidebar-logo"
              src="/images/logoTransp_cropped.png"
              alt="Storegården 7"
            />
            <span className="admin-sidebar-rail-mark" aria-hidden="true">
              S7
            </span>
            <span className="admin-sidebar-brand-caption">Administration</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Stäng adminmenyn"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? "Expandera sidomenyn" : "Minimera sidomenyn"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expandera sidomenyn" : "Minimera sidomenyn"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={17} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={17} aria-hidden="true" />
          )}
        </button>
        
        <div className="admin-sidebar-groups">
          {ADMIN_VIEW_GROUPS.map((group) => (
            <div key={group.title} className="admin-sidebar-group">
              <h3 className="admin-sidebar-group-title">{group.title}</h3>
              <nav className="admin-sidebar-nav">
                {group.options.map((option) => (
                  (() => {
                    const Icon = NAV_ICONS[option.value] || ShoppingBag;
                    const isActive = adminView === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`admin-sidebar-link ${isActive ? "active" : ""}`}
                        onClick={() => onViewChange(option.value)}
                        aria-label={option.label}
                        aria-current={isActive ? "page" : undefined}
                        title={isCollapsed ? option.label : undefined}
                      >
                        <Icon size={18} aria-hidden="true" />
                        <span>{option.label}</span>
                        <ChevronRight
                          className="admin-sidebar-chevron"
                          size={16}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })()
                ))}
              </nav>
            </div>
          ))}

          <div className="admin-sidebar-footer">
            <Link
              to="/"
              className="admin-sidebar-link admin-sidebar-home"
              aria-label="Till webbplatsen"
              title={isCollapsed ? "Till webbplatsen" : undefined}
            >
              <House size={18} aria-hidden="true" />
              <span>Till webbplatsen</span>
            </Link>
          </div>
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
  isCollapsed: PropTypes.bool,
  onToggleCollapsed: PropTypes.func,
};

export default AdminSidebar;
