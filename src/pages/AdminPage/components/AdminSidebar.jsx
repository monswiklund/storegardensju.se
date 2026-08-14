import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  Flower2,
  FileText,
  GalleryHorizontal,
  House,
  LayoutDashboard,
  Package,
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
  notifications: Bell,
  yoga: Flower2,
  gallery: GalleryHorizontal,
  coupons: Tags,
  stats: BarChart3,
};

function AdminSidebar({
  adminView,
  onViewChange,
  isOpen,
  onClose,
  isExpanded,
  onExpandedChange,
}) {
  const cmsAdminUrl = import.meta.env.DEV
    ? "http://localhost:3002/admin"
    : "https://cms.storegardensju.se/admin";
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
        data-state={isExpanded ? "expanded" : "collapsed"}
        onPointerEnter={() => onExpandedChange(true)}
        onPointerLeave={() => onExpandedChange(false)}
        onFocus={() => onExpandedChange(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            onExpandedChange(false);
          }
        }}
      >
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <img
              className="admin-sidebar-logo admin-sidebar-logo-full"
              src="/images/logoTransp_cropped.png"
              alt="Storegården 7"
            />
            <img
              className="admin-sidebar-logo admin-sidebar-logo-mini"
              src="/images/logoTransp_cropped.png"
              alt=""
              aria-hidden="true"
            />
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
                        title={!isExpanded ? option.label : undefined}
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
            <a
              href={cmsAdminUrl}
              className="admin-sidebar-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Redigera hemsidans texter"
              title={!isExpanded ? "Redigera hemsidans texter" : undefined}
            >
              <FileText size={18} aria-hidden="true" />
              <span>Redigera sidtexter</span>
            </a>
            <Link
              to="/"
              className="admin-sidebar-link admin-sidebar-home"
              aria-label="Till webbplatsen"
              title={!isExpanded ? "Till webbplatsen" : undefined}
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
  isExpanded: PropTypes.bool,
  onExpandedChange: PropTypes.func,
};

export default AdminSidebar;
