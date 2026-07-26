import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import NavLinks from "./NavLinks";
import useNavbarToggle from "./useNavbarToggle";
import { appRoutes, normalizePath } from "../../../config/routes.js";
import CartBadge from "./CartBadge.jsx";
import NotificationBell from "./NotificationBell.jsx";

const ALL_NAV_ITEMS = appRoutes.filter((route) => !route.hidden);
const NAV_ITEMS = ALL_NAV_ITEMS.filter((route) => !route.headerHidden);

const getCurrentTitle = (pathname) => {
  for (const item of ALL_NAV_ITEMS) {
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

        <div
          id="mobile-navigation"
          ref={menuRef}
          className={`nav-menu ${isOpen ? "open" : ""}`}
          aria-label="Meny"
        >
          <div className="nav-menu-header" tabIndex="-1">
            <span className="nav-menu-title">Meny</span>
            <span className="nav-menu-subtitle">Utforska Storegården 7</span>
          </div>
          <NavLinks
            items={NAV_ITEMS}
            currentPath={currentPath}
            onNavigate={handleNavigate}
          />
        </div>

        {isOpen && (
          <button
            type="button"
            className="nav-overlay"
            aria-label="Stäng meny"
            tabIndex="-1"
            onClick={close}
          />
        )}

        <div className="navbar-right">
          <NotificationBell />
          <CartBadge />
          <button
            ref={triggerRef}
            className={`hamburger ${isOpen ? "open" : ""}`}
            onClick={toggle}
            aria-label={isOpen ? "Stäng meny" : "Öppna meny"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
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
