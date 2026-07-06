import { useCallback } from "react";

const DEFAULT_SCROLL_OPTIONS = {
  behavior: "smooth",
  block: "center",
};

function useScrollToSelector(selector, options = DEFAULT_SCROLL_OPTIONS) {
  return useCallback(() => {
    if (selector && selector.includes("contact")) {
      window.dispatchEvent(new CustomEvent("expand-contact-form"));
    }
    const target = selector ? document.querySelector(selector) : null;
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView(options);
    }
  }, [selector, options]);
}

export default useScrollToSelector;
