import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import NavLinks from "./NavLinks";
import useNavbarToggle from "./useNavbarToggle";
import { appRoutes, normalizePath } from "../../../config/routes.js";
import CartBadge from "./CartBadge.jsx";

const NAV_ITEMS = appRoutes.filter(route => !route.hidden);

const getCurrentTitle = (pathname) => {
  for (const item of NAV_ITEMS) {
    const children = item.children ?? [];
    const child = children.find(route => route.path === pathname);
    if (child) return child.label;
    if (item.path === pathname) return item.label;
  }

  return "Hem";
};

function Navbar() {
  const location = useLocation();
  const { isOpen, toggle, close, menuRef, triggerRef } = useNavbarToggle();
  const pendingScrollTargetRef = useRef(null);
  // Trailing slash: GitHub Pages serves /kurser/ but appRoutes holds /kurser.
  const currentPath = normalizePath(location.pathname);
  const currentTitle = getCurrentTitle(currentPath);

  const scrollToHeroTitle = () => {
    if (typeof window === "undefined") return;
    const target = document.querySelector(".hero-titel");
    if (!target) return;

    const navbarHeight =
      document.querySelector(".navbar")?.getBoundingClientRect()?.height ?? 0;
    const targetRect = target.getBoundingClientRect();
    const targetCenter =
      window.scrollY + targetRect.top + targetRect.height / 2;
    const desiredCenter = (window.innerHeight + navbarHeight) / 2;
    const scrollTarget = targetCenter - desiredCenter;

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
        <span className="navbar-page-title">{currentTitle}</span>

        <Link
          to="/"
          className="navbar-brand"
          aria-label="Till startsidan"
          onClick={() => handleNavigate("/")}
        >
          <img src="/images/logoTransp_cropped.png" alt="Storegården 7" className="navbar-logo" />
        </Link>

        <div ref={menuRef} className={`nav-menu ${isOpen ? "open" : ""}`}>
          <NavLinks
            items={NAV_ITEMS}
            currentPath={currentPath}
            onNavigate={handleNavigate}
          />
        </div>

        {/* BUTIK - Avkommentera för att visa varukorgsikonen */}
        <div className="navbar-right">
          <CartBadge />
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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
