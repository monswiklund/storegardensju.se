import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getScrollTarget,
  smoothScrollTo,
  scrollToSelector,
} from "./scrollUtils.js";

describe("scrollUtils", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    delete window.storegardenLenis;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete window.storegardenLenis;
  });

  describe("getScrollTarget", () => {
    it("returns null for invalid or empty inputs", () => {
      expect(getScrollTarget(null)).toBeNull();
      expect(getScrollTarget(undefined)).toBeNull();
      expect(getScrollTarget("")).toBeNull();
      expect(getScrollTarget("   ")).toBeNull();
      expect(getScrollTarget(123)).toBeNull();
    });

    it("returns the HTMLElement directly when an element is provided", () => {
      const div = document.createElement("div");
      document.body.appendChild(div);
      expect(getScrollTarget(div)).toBe(div);
    });

    it("finds elements by bare ID", () => {
      const section = document.createElement("div");
      section.id = "event-details-section";
      document.body.appendChild(section);

      expect(getScrollTarget("event-details-section")).toBe(section);
    });

    it("finds elements by hash ID selector", () => {
      const section = document.createElement("div");
      section.id = "event-details-section";
      document.body.appendChild(section);

      expect(getScrollTarget("#event-details-section")).toBe(section);
    });

    it("finds elements by class selector", () => {
      const section = document.createElement("div");
      section.className = "contact-container";
      document.body.appendChild(section);

      expect(getScrollTarget(".contact-container")).toBe(section);
    });

    it("gracefully returns null if element does not exist", () => {
      expect(getScrollTarget("non-existent-id")).toBeNull();
      expect(getScrollTarget("#non-existent-id")).toBeNull();
    });
  });

  describe("smoothScrollTo", () => {
    it("uses Lenis scrollTo when storegardenLenis is present on window", () => {
      const target = document.createElement("div");
      target.id = "event-details-section";
      document.body.appendChild(target);

      const mockLenisScrollTo = vi.fn();
      window.storegardenLenis = {
        scrollTo: mockLenisScrollTo,
      };

      smoothScrollTo("event-details-section", 130);

      expect(mockLenisScrollTo).toHaveBeenCalledWith(target, {
        offset: -130,
        duration: 1.2,
      });
    });

    it("falls back to window.scrollTo with smooth behavior when Lenis is absent", () => {
      const target = document.createElement("div");
      target.id = "event-details-section";
      document.body.appendChild(target);

      // Mock getBoundingClientRect
      vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
        top: 500,
        bottom: 600,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      });

      // Mock window.scrollY
      Object.defineProperty(window, "scrollY", {
        value: 100,
        writable: true,
        configurable: true,
      });

      const mockScrollTo = vi.fn();
      window.scrollTo = mockScrollTo;

      smoothScrollTo("event-details-section", 130);

      // top = 500 + 100 - 130 = 470
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 470,
        behavior: "smooth",
      });
    });

    it("does nothing when target is not found", () => {
      const mockScrollTo = vi.fn();
      window.scrollTo = mockScrollTo;

      smoothScrollTo("missing-element", 130);

      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe("scrollToSelector", () => {
    it("calls scrollIntoView on found element", () => {
      const target = document.createElement("div");
      target.id = "test-elem";
      target.scrollIntoView = vi.fn();
      document.body.appendChild(target);

      scrollToSelector("#test-elem", { behavior: "smooth", block: "center" });

      expect(target.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });
  });
});
