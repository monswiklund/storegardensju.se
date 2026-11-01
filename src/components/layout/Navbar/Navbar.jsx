import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import usePageCopy from "../../../hooks/usePageCopy.js";
import usePageMedia from "../../../hooks/usePageMedia.js";
import "./Navbar.css";
import NavLinks from "./NavLinks";
import useNavbarToggle from "./useNavbarToggle";
import { appRoutes, canonicalPath, normalizePath, routeLabel } from "../../../config/routes.js";
import CartBadge from "./CartBadge.jsx";
import NotificationBell from "./NotificationBell.jsx";
import useShopHasProducts from "../../../hooks/useShopHasProducts.js";
import { COURSE_LOCATION } from "../../../data/courseEvents.js";
import { contactEmail } from "../../../features/contact/contact.js";

const ALL_NAV_ITEMS = appRoutes.filter((route) => !route.hidden);
const NAV_ITEMS = ALL_NAV_ITEMS.filter((route) => !route.headerHidden);

// Pages outside the menu still say where you are, instead of falling back to "Hem".
const EXTRA_TITLES = [{ path: "/varukorg", label: "Varukorg" }];
const TITLED_ROUTES = [
  ...ALL_NAV_ITEMS.flatMap((item) => [item, ...(item.children ?? [])]),
  ...EXTRA_TITLES,
];

/** The name of the page or, below it (/butik/12, /evenemang/x), its section; empty when unknown. */
export const getCurrentTitle = (pathname, copy) => {
  const match = TITLED_ROUTES.filter(
    (route) => route.path === pathname || (route.path !== "/" && pathname.startsWith(`${route.path}/`)),
  ).sort((a, b) => b.path.length - a.path.length)[0];
  return match ? routeLabel(match, copy) : "";
};

function Navbar() {
  const siteCopy = usePageCopy("site");
  const siteMedia = usePageMedia("site");
  // Keep the wide logo's original aspect ratio; the generated thumbnail is 4:3.
  const logo = siteMedia("brand.logo", "/images/logoTransp_cropped.png");
  const location = useLocation();
  const { isOpen, toggle, close, menuRef, triggerRef } = useNavbarToggle();
  const pendingScrollTargetRef = useRef(null);
  // Trailing slash: GitHub Pages serves /kurser/ but appRoutes holds /kurser.
  const currentPath = normalizePath(location.pathname);
  const currentTitle = getCurrentTitle(currentPath, siteCopy);
  const shopHasProducts = useShopHasProducts();
  // On the home page the hero carries the big logo; the bar's own fades in once that one is gone.
  const isHome = currentPath === "/";
  const [heroLogoInView, setHeroLogoInView] = useState(isHome);
  const navItems = shopHasProducts
    ? NAV_ITEMS
    : NAV_ITEMS.filter((route) => !route.shopOnly);
  const contactRoute = navItems.find((route) => route.cta);

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
    if (!isHome) {
      setHeroLogoInView(false);
      return undefined;
    }

    const update = () => {
      const mark = document.querySelector(".hero-logo-mark");
      // Until the hero has rendered, keep the state: showing and hiding again would blink.
      if (!mark) return;
      const barBottom = document.querySelector(".navbar")?.getBoundingClientRect().bottom ?? 0;
      setHeroLogoInView(mark.getBoundingClientRect().bottom > barBottom);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // The hero is a lazy page chunk, so it can mount after this effect.
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [isHome]);

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
    <nav className="navbar" aria-label={siteCopy("ui.menu")}>
      <div className="navbar-container">
        <Link
          to="/"
          className={`navbar-brand${isHome && heroLogoInView ? " is-tucked" : ""}`}
          aria-label={siteCopy("nav.home")}
          onClick={() => handleNavigate("/")}
        >
          {logo && <img src={logo} alt="Storegården 7" className="navbar-logo" />}
        </Link>

        <div
          id="mobile-navigation"
          ref={menuRef}
          className={`nav-menu ${isOpen ? "open" : ""}`}
        >
          <NavLinks
            items={navItems}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            copy={siteCopy}
          />
          {/* Phone menu only: what people most often open a menu for. */}
          <div className="nav-menu-contact">
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            <a href={COURSE_LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer">
              {COURSE_LOCATION.name}, {COURSE_LOCATION.locality}
            </a>
            <div className="nav-menu-social">
              <a
                href="https://www.instagram.com/storegarden7/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Besök oss på Instagram"
              >
                <Instagram size={22} aria-hidden="true" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61564642647081"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Besök oss på Facebook"
              >
                <Facebook size={22} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          <NotificationBell />
          <CartBadge />
          {/* Desktop: Kontakt stands at the right edge, apart from the links; phones have it in the menu. */}
          {contactRoute && (
            <Link
              to={canonicalPath(contactRoute.path)}
              className={`nav-link nav-link--cta navbar-contact${currentPath === contactRoute.path ? " active" : ""}`}
              aria-current={currentPath === contactRoute.path ? "page" : undefined}
              onClick={() => handleNavigate(contactRoute.path)}
            >
              {routeLabel(contactRoute, siteCopy)}
            </Link>
          )}
          {/* The page you are on, next to the menu it lives in; the name stays in the button's label. */}
          <button
            ref={triggerRef}
            className="menu-trigger"
            onClick={toggle}
            aria-label={[currentTitle, isOpen ? siteCopy("ui.close-menu") : siteCopy("ui.open-menu")]
              .filter(Boolean)
              .join(", ")}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            type="button"
          >
            {currentTitle && <span className="navbar-page-title">{currentTitle}</span>}
            <span className={`hamburger ${isOpen ? "open" : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
