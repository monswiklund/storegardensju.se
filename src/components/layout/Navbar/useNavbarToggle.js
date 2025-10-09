import { useState, useEffect, useRef, useCallback } from "react";

function useNavbarToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
