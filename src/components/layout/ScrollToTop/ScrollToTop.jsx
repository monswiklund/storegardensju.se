import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_POSITIONS_KEY = "storegarden-scroll-positions";

// Browser-native restoration fights Lenis and the rAF retries below,
// so we own scroll restoration entirely.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function readPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_POSITIONS_KEY)) ?? {};
  } catch {
    return {};
  }
}

function savePosition(key) {
  try {
    const positions = readPositions();
    positions[key] = window.scrollY;
    sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
  } catch {
    // sessionStorage unavailable (private mode/quota) — skip restoration silently
  }
}

// Anchored sections (e.g. /kurser/yoga#yoga-30-juli) are shared links and appear in
// Event structured data, so a deep link must land on the section. Retries cover
// lazy routes and images that have not laid out on the first frame.
const HASH_SCROLL_RETRIES_MS = [0, 100, 300, 600];

// Lenis scrolls to the element's raw offset and ignores scroll-margin-top, so
// the clearance for the fixed 60px navbar has to be passed explicitly. Keep in
// sync with the scroll-margin-top used by anchored sections in CSS.
const NAV_CLEARANCE_PX = 80;

// Sections with children (Event, Kurser) also render a fixed subnav bar under
// the navbar, so the target has to clear both or it lands behind the bar.
function navClearance() {
  const subnav = document.querySelector(".event-subnav.active");
  const subnavHeight = subnav ? subnav.getBoundingClientRect().height : 0;
  return NAV_CLEARANCE_PX + subnavHeight;
}

function scrollToHash(hash) {
  const id = decodeURIComponent(hash.slice(1));
  if (!id) return false;

  const target = document.getElementById(id);
  if (!target) return false;

  // Lenis owns the scroll position when present; scrollIntoView alone gets
  // overridden on the next Lenis frame. Both paths respect scroll-margin-top.
  if (window.storegardenLenis?.scrollTo) {
    window.storegardenLenis.scrollTo(target, {
      offset: -navClearance(),
      immediate: true,
      force: true,
    });
    return true;
  }

  target.scrollIntoView({ behavior: "auto", block: "start" });
  return true;
}

function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  // Track scroll position for the current history entry so a later
  // back/forward navigation can land where the user left off.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => savePosition(key);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      savePosition(key);
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // A hash wins over both top-scroll and position restoration: the URL names
    // the section the visitor asked for.
    if (hash) {
      const timers = HASH_SCROLL_RETRIES_MS.map((delay) =>
        window.setTimeout(() => scrollToHash(hash), delay)
      );
      const frame = window.requestAnimationFrame(() => scrollToHash(hash));

      return () => {
        timers.forEach(window.clearTimeout);
        window.cancelAnimationFrame(frame);
      };
    }

    // POP = back/forward: restore saved position. PUSH/REPLACE: start at top.
    const targetY = navigationType === "POP" ? readPositions()[key] ?? 0 : 0;

    const applyScroll = () => {
      window.storegardenLenis?.scrollTo?.(targetY, {
        immediate: true,
        force: true,
      });
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    };

    applyScroll();
    window.requestAnimationFrame(applyScroll);
    window.setTimeout(applyScroll, 0);
    // Lazy routes/images may not have laid out yet; retry once content settles.
    if (targetY > 0) {
      window.setTimeout(applyScroll, 100);
    }
  }, [pathname, hash, key, navigationType]);

  return null;
}

export default ScrollToTop;
