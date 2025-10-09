export function scrollToSelector(selector, options = { behavior: "smooth", block: "center" }) {
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView(options);
  }
}
