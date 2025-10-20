import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";
import NavLinks from "./NavLinks";
import useNavbarToggle from "./useNavbarToggle";
import { appRoutes } from "../../../config/routes.js";

const NAV_ITEMS = appRoutes;

function Navbar() {
  const location = useLocation();
  const { isOpen, toggle, close, menuRef, triggerRef } = useNavbarToggle();
  const pendingScrollTargetRef = useRef(null);

  const scrollToHeroTitle = () => {
    if (typeof window === "undefined") return;
    const target = document.querySelector(".hero-titel");
    if (!target) return;

    const navbarHeight =
      document.querySelector(".navbar")?.getBoundingClientRect()?.height ?? 0;
    const targetRect = target.getBoundingClientRect();
    const scrollTarget = window.scrollY + targetRect.top - navbarHeight - 12;

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(scrollTarget, 0),
        behavior: "smooth",
      });
    });
  };

  const handleNavigate = (path) => {
    close();
    if (path === "/") {
      if (location.pathname === "/") {
        scrollToHeroTitle();
      } else {
        pendingScrollTargetRef.current = ".hero-titel";
      }
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      pendingScrollTargetRef.current = null;
      return;
    }

    if (!pendingScrollTargetRef.current) return;
    pendingScrollTargetRef.current = null;
    scrollToHeroTitle();
  }, [location.pathname]);

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
