import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const focusableSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const clampIndex = (index, length) => {
  if (length === 0) return 0;
  const normalized = index % length;
  return normalized < 0 ? normalized + length : normalized;
};

/**
 * Encapsulates lightbox state handling, focus management, keyboard shortcuts,
 * and preloading for the gallery.
 */
function useGalleryLightbox(images, categoryKey) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const preloadedSourcesRef = useRef(new Set());

  const hasImages = images.length > 0;

  const openLightbox = useCallback(
    (index) => {
      if (!hasImages) return;
      previouslyFocusedRef.current = document.activeElement;
      setCurrentIndex(clampIndex(index, images.length));
      setIsOpen(true);
    },
    [hasImages, images.length]
  );

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goToImage = useCallback(
    (index) => {
      if (!hasImages) return;
      setCurrentIndex(clampIndex(index, images.length));
    },
    [hasImages, images.length]
  );

  const goToNextImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [hasImages, images.length]);

  const goToPreviousImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [hasImages, images.length]);

  // Keep index inside bounds whenever the image list changes.
  useEffect(() => {
    if (!hasImages) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => {
      if (prev >= images.length) return images.length - 1;
      if (prev < 0) return 0;
      return prev;
    });
  }, [hasImages, images.length]);

  // Add/remove body class for lightbox mode.
  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove("lightbox-open");
      return;
    }

    document.body.classList.add("lightbox-open");
    return () => {
      document.body.classList.remove("lightbox-open");
    };
  }, [isOpen]);

  // Restore focus to the triggering element when closing.
  useEffect(() => {
    if (isOpen) {
      const closeBtn = closeButtonRef.current;
      if (closeBtn) {
        closeBtn.focus({ preventScroll: true });
      }
      return;
    }

    const node = previouslyFocusedRef.current;
    if (node && typeof node.focus === "function") {
      requestAnimationFrame(() => {
        node.focus({ preventScroll: true });
        previouslyFocusedRef.current = null;
      });
    }
  }, [isOpen]);

  // Handle escape key to close the lightbox.
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeLightbox]);

  // Arrow-key navigation and Home/End shortcuts.
  useEffect(() => {
    if (!isOpen || !hasImages) return;

    const handleKeyNavigation = (event) => {
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          goToNextImage();
          break;
        case "ArrowLeft":
          event.preventDefault();
          goToPreviousImage();
          break;
        case "Home":
          event.preventDefault();
          goToImage(0);
          break;
        case "End":
          event.preventDefault();
          goToImage(images.length - 1);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyNavigation);
    return () => {
      document.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [
    isOpen,
    hasImages,
    images.length,
    goToNextImage,
    goToPreviousImage,
    goToImage,
  ]);

  // Trap focus within the lightbox dialog.
  useEffect(() => {
    if (!isOpen) return;
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    const handleTabConstraint = (event) => {
      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogNode.querySelectorAll(focusableSelector)
      ).filter((el) => !el.hasAttribute("aria-hidden"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const isShift = event.shiftKey;
      const activeElement = document.activeElement;

      if (!isShift && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (isShift && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    };

    document.addEventListener("keydown", handleTabConstraint);
    return () => {
      document.removeEventListener("keydown", handleTabConstraint);
    };
  }, [isOpen]);

  const preloadImageAtIndex = useCallback(
    (index) => {
      if (!hasImages) return;
      const normalizedIndex = clampIndex(index, images.length);
      const item = images[normalizedIndex];
      if (!item?.original) return;
      if (preloadedSourcesRef.current.has(item.original)) return;

      const img = new Image();
      img.src = item.original;
      preloadedSourcesRef.current.add(item.original);
    },
    [hasImages, images]
  );

  useEffect(() => {
    preloadedSourcesRef.current.clear();
    setCurrentIndex(0); // Reset index when category changes
  }, [categoryKey]);

  useEffect(() => {
    if (!isOpen || !hasImages) return;
    preloadImageAtIndex(currentIndex);
    preloadImageAtIndex(currentIndex + 1);
    preloadImageAtIndex(currentIndex - 1);
  }, [isOpen, hasImages, currentIndex, preloadImageAtIndex]);

  const currentImage = useMemo(() => {
    if (!hasImages) return null;
    return images[currentIndex];
  }, [hasImages, images, currentIndex]);

  return {
    isOpen,
    currentIndex,
    currentImage,
    openLightbox,
    closeLightbox,
    goToImage,
    goToNextImage,
    goToPreviousImage,
    dialogRef,
    closeButtonRef,
  };
}

export default useGalleryLightbox;
