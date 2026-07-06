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

function ScrollToTop() {
  const { pathname, key } = useLocation();
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
  }, [pathname, key, navigationType]);

  return null;
}

export default ScrollToTop;
