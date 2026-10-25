import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { heroContent } from "../../../data/homeContent.js";
import { canonicalPath } from "../../../config/routes.js";
import usePageCopy, { useSiteCopy } from "../../../hooks/usePageCopy.js";
import usePageMedia from "../../../hooks/usePageMedia.js";
import { smoothScrollTo } from "../../../utils/scrollUtils.js";
import { savedScrollPosition } from "../../../components/layout/ScrollToTop/ScrollToTop.jsx";
import "./Hero.css";
import HomeHeroContent from "./HomeHeroContent.jsx";

const INTRO_HOLD_MS = 2000;
// If the logo never loads (offline, slow CDN), the intro still ends.
const INTRO_MAX_MS = 5000;
// The page holds still while the logo glides into place (0.9 s)...
const LOCK_MIN_MS = 1000;
// ...and until the trackpad stops sending momentum wheel events after the finger lifts,
// otherwise that momentum would carry the visitor past the hero.
const LOCK_QUIET_MS = 200;
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "End", "Home"]);

// Every visit opens on the logo alone, as the site always has. A link to a section (/#kontakt),
// or back/reload to a scrolled position, goes straight there: the restored position assumes the
// settled hero height. Reduced motion keeps the intro but drops the movement (Hero.css).
function shouldPlayIntro(location, navigationType) {
  if (location.hash) return false;
  return !(navigationType === "POP" && savedScrollPosition(location.key) > 0);
}

// The intro logo is as wide as the old full-screen logo: clamp(240px, 42vw, 380px).
const introLogoWidth = () => Math.min(380, Math.max(240, window.innerWidth * 0.42));

// Two seconds after the logo has loaded, or at the first scroll, tap or key press, it glides
// into place above the heading and the welcome text and actions fade in.
function HomeHeroSection() {
  const navigate = useNavigate();
  const copy = usePageCopy("home");
  const siteMedia = usePageMedia("site");
  // The logo is a wide, transparent mark. Generated card/thumbnail variants
  // are 4:3 crops and distort it, so keep the original aspect ratio here.
  const logo = siteMedia("brand.logo", "/images/logoTransp_cropped.png");
  const { paragraphs, primaryCta, secondaryCtas } = heroContent;
  const editableParagraphs = paragraphs.map((paragraph, index) =>
    copy(`hero.paragraphs.${index}`),
  );

  const siteCopy = useSiteCopy();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [isIntro, setIsIntro] = useState(() => shouldPlayIntro(location, navigationType));

  const sectionRef = useRef(null);

  // Moves the logo from its final place to the middle of the first viewport, before paint.
  // Settling then just drops these offsets, so the logo glides back with a CSS transition.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const mark = section?.querySelector(".hero-logo-mark");
    if (!isIntro || !mark) return undefined;
    let appliedDy = 0;
    const place = () => {
      const rect = mark.getBoundingClientRect();
      // getBoundingClientRect includes the current translate; scale keeps the centre where it is.
      const centre = rect.top + rect.height / 2 - appliedDy;
      const target = (section.getBoundingClientRect().top + window.innerHeight) / 2;
      const dy = target - centre;
      if (Math.abs(dy - appliedDy) >= 0.5) {
        appliedDy = dy;
        section.style.setProperty("--intro-logo-dy", `${dy}px`);
      }
      section.style.setProperty("--intro-logo-scale", String(introLogoWidth() / (mark.offsetWidth || 1)));
    };
    // Re-measure every frame of the short intro: the logo image, web fonts, the subnav and
    // window resizes all shift the layout after the first paint.
    let frame;
    const follow = () => {
      place();
      frame = requestAnimationFrame(follow);
    };
    place();
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [isIntro]);

  const introAtMount = useRef(isIntro);
  const settleRef = useRef(() => setIsIntro(false));

  // The first scroll (wheel, swipe or scroll key) starts the transition instead of moving the
  // page, and the page stays locked until the logo has landed. Mount-only, so the lock outlives
  // the isIntro change it triggers. Captured on window before Lenis sees the event;
  // lenisStopPropagation keeps Lenis from smooth-scrolling a wheel event we cancelled.
  useEffect(() => {
    if (!introAtMount.current) return undefined;
    let settledAt = null;
    let lastInput = 0;
    let quietTimer;
    const capture = { capture: true, passive: false };

    const release = () => {
      clearTimeout(quietTimer);
      window.removeEventListener("wheel", hold, capture);
      window.removeEventListener("touchmove", hold, capture);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", settle, true);
    };
    const releaseWhenQuiet = () => {
      const now = performance.now();
      if (now - settledAt >= LOCK_MIN_MS && now - lastInput >= LOCK_QUIET_MS) release();
      else quietTimer = setTimeout(releaseWhenQuiet, 50);
    };
    function settle() {
      if (settledAt !== null) return;
      settledAt = performance.now();
      setIsIntro(false);
      releaseWhenQuiet();
    }
    function hold(event) {
      lastInput = performance.now();
      event.lenisStopPropagation = true;
      if (event.cancelable) event.preventDefault();
      settle();
    }
    function onKey(event) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (SCROLL_KEYS.has(event.key) && !typing) hold(event);
      else settle();
    }

    settleRef.current = settle;
    window.addEventListener("wheel", hold, capture);
    window.addEventListener("touchmove", hold, capture);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", settle, true);
    return release;
  }, []);

  // Without any input, the intro ends two seconds after the logo has loaded.
  useEffect(() => {
    if (!isIntro) return undefined;
    const settle = () => settleRef.current();
    let holdTimer;
    const image = new Image();
    image.onload = () => {
      holdTimer = setTimeout(settle, INTRO_HOLD_MS);
    };
    image.onerror = settle;
    image.src = logo;
    const maxTimer = setTimeout(settle, INTRO_MAX_MS);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(maxTimer);
      image.onload = null;
      image.onerror = null;
    };
  }, [isIntro, logo]);

  const handlePrimaryCta = () => {
    window.dispatchEvent(new CustomEvent("expand-contact-form"));
    smoothScrollTo(".contact-container", 80);
  };

  const handleSecondaryRoute = (to) => navigate(canonicalPath(to));

  return (
    <div
      id="home-welcome"
      ref={sectionRef}
      data-cms-hero
      className={`hero-content-section${isIntro ? " is-intro" : ""}`}
    >
      <HomeHeroContent
        logo={logo}
        title={copy("hero.title")}
        subtitle={copy("hero.subtitle")}
        paragraphs={editableParagraphs}
        primaryCta={{ ...primaryCta, label: copy("hero.primary-cta") }}
        secondaryCtas={secondaryCtas.map((cta, index) => ({
          ...cta,
          label: copy(`hero.secondary-ctas.${index}`),
        }))}
        onPrimaryClick={handlePrimaryCta}
        onRouteClick={handleSecondaryRoute}
      />
      {isIntro && (
        <button
          type="button"
          className="hero-intro-skip"
          onClick={() => settleRef.current()}
          aria-label={siteCopy("ui.scroll-down")}
        >
          <span>{copy("hero.discover-more")}</span>
          <span className="hero-intro-skip-line" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default HomeHeroSection;
