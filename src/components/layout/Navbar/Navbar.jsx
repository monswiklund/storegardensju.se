import { useLocation } from "react-router-dom";
import "./Navbar.css";
import NavLinks from "./NavLinks";
import useNavbarToggle from "./useNavbarToggle";
import { appRoutes } from "../../../config/routes.js";

const NAV_ITEMS = appRoutes;

function Navbar() {
  const location = useLocation();
  const { isOpen, toggle, close, menuRef, triggerRef } = useNavbarToggle();

  const handleNavigate = () => {
    close();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Huvudnavigation">
      <div className="navbar-container">
        <button
          ref={triggerRef}
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={toggle}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <div ref={menuRef} className={`nav-menu ${isOpen ? "open" : ""}`}>
          <NavLinks
            items={NAV_ITEMS}
            currentPath={location.pathname}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
