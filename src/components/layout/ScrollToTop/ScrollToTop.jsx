import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname, key } = useLocation();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    window.requestAnimationFrame(scrollToTop);
    window.setTimeout(scrollToTop, 0);
  }, [pathname, key]);

  return null;
}

export default ScrollToTop;
