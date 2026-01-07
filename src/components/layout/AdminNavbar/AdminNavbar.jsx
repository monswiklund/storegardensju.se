import { Link, useLocation } from "react-router-dom";
import useNavbarToggle from "../Navbar/useNavbarToggle";
import "./AdminNavbar.css";

const ADMIN_LINKS = [
  { href: "/admin?view=overview", label: "Översikt", view: "overview" },
  { href: "/admin?view=stats", label: "Statistik", view: "stats" },
  { href: "/admin?view=orders", label: "Ordrar", view: "orders" },
];

function AdminNavbar() {
  const location = useLocation();
  const { isOpen, toggle, close, menuRef, triggerRef } = useNavbarToggle();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const viewParam = new URLSearchParams(location.search).get("view") || "overview";

  return (
    <nav className="admin-navbar" role="navigation" aria-label="Adminnavigation">
      <div className="admin-navbar-container">
        <div className="admin-navbar-brand">
          <span className="admin-navbar-title">Adminpanel</span>
          <span className="admin-navbar-subtitle">Storegården 7</span>
        </div>
        <div className="admin-navbar-actions">
          <Link className="admin-navbar-back" to="/">
            Tillbaka till webbshop
          </Link>
          <button
            ref={triggerRef}
            className={`admin-hamburger ${isOpen ? "open" : ""}`}
            onClick={toggle}
            aria-label="Toggle admin menu"
            aria-expanded={isOpen}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div ref={menuRef} className={`admin-nav-menu ${isOpen ? "open" : ""}`}>
        <div className="admin-nav-links">
          {ADMIN_LINKS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`admin-nav-link ${
                item.view === viewParam ? "active" : ""
              }`}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {isAdminRoute && (
          <Link className="admin-nav-back" to="/" onClick={close}>
            Tillbaka till webbshop
          </Link>
        )}
      </div>
    </nav>
  );
}

export default AdminNavbar;
