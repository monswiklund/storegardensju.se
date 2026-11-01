import { useState, useEffect, useRef, useCallback } from "react";

function useNavbarToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const wasOpenRef = useRef(false);
  const previousOverflowRef = useRef("");

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const menuNode = menuRef.current;

    if (isOpen) {
      wasOpenRef.current = true;
      previousOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("mobile-nav-open");

      // Everything but the bar is out of reach while the menu covers it: no tabbing or
      // screen-reader browsing into the page behind. The bar keeps its close button.
      const inerted = [];
      for (let node = menuNode?.closest(".navbar"); node?.parentElement; node = node.parentElement) {
        if (node === document.body) break;
        for (const sibling of node.parentElement.children) {
          if (sibling !== node && !sibling.inert) {
            sibling.inert = true;
            inerted.push(sibling);
          }
        }
      }

      const focusFrame = window.requestAnimationFrame(() => {
        menuNode?.querySelector("a[href]")?.focus({ preventScroll: true });
      });

      return () => {
        window.cancelAnimationFrame(focusFrame);
        inerted.forEach((node) => {
          node.inert = false;
        });
        document.body.style.overflow = previousOverflowRef.current;
        document.body.classList.remove("mobile-nav-open");
      };
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }

    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      const menuNode = menuRef.current;
      const triggerNode = triggerRef.current;
      if (!menuNode || !triggerNode) return;

      if (
        !menuNode.contains(event.target) &&
        !triggerNode.contains(event.target)
      ) {
        close();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    toggle,
    close,
    menuRef,
    triggerRef,
  };
}

export default useNavbarToggle;
