export function getScrollTarget(targetOrSelector) {
  if (!targetOrSelector) return null;
  if (typeof targetOrSelector !== "string") {
    return targetOrSelector instanceof HTMLElement ? targetOrSelector : null;
  }
  const trimmed = targetOrSelector.trim();
  if (!trimmed) return null;

  // If it's a simple alphanumeric/hyphen ID without CSS selector special characters
  if (!/[#.[\]: >+~]/.test(trimmed)) {
    const elById = document.getElementById(trimmed);
    if (elById) return elById;
  }

  try {
    const el = document.querySelector(trimmed);
    if (el) return el;
  } catch {
    // Malformed selector fallback
  }

  if (trimmed.startsWith("#")) {
    return document.getElementById(trimmed.slice(1));
  }

  return document.getElementById(trimmed);
}

export function smoothScrollTo(targetOrSelector, offset = 0) {
  if (typeof window === "undefined") return;

  const target = getScrollTarget(targetOrSelector);
  if (!target) return;

  if (window.storegardenLenis?.scrollTo) {
    window.storegardenLenis.scrollTo(target, {
      offset: -offset,
      duration: 1.2,
    });
    return;
  }

  const y = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: Math.max(0, y),
    behavior: "smooth",
  });
}

export function scrollToSelector(selector, options = { behavior: "smooth", block: "center" }) {
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView(options);
  }
}

