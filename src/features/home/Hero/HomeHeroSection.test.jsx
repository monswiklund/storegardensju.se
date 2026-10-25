import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeHeroSection from "./HomeHeroSection.jsx";

const wheel = () => {
  const event = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
  window.dispatchEvent(event);
  return event;
};

const renderHero = () =>
  render(
    <MemoryRouter>
      <HomeHeroSection />
    </MemoryRouter>,
  );

afterEach(() => {
  vi.useRealTimers();
});

describe("HomeHeroSection intro", () => {
  it("starts the transition on the first scroll and holds the page until the logo has landed", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const { container } = renderHero();
    const section = container.querySelector(".hero-content-section");
    expect(section).toHaveClass("is-intro");

    let first;
    act(() => {
      first = wheel();
    });
    expect(first.defaultPrevented).toBe(true);
    expect(section).not.toHaveClass("is-intro");

    // Trackpad momentum during the glide is swallowed too.
    act(() => vi.advanceTimersByTime(500));
    expect(wheel().defaultPrevented).toBe(true);

    // Once the glide is over and the wheel has gone quiet, the page scrolls normally.
    act(() => vi.advanceTimersByTime(1000));
    expect(wheel().defaultPrevented).toBe(false);
  });

  it("goes straight to the hero for a link to a section", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/#kontakt"]}>
        <HomeHeroSection />
      </MemoryRouter>,
    );
    expect(container.querySelector(".hero-content-section")).not.toHaveClass("is-intro");
    expect(wheel().defaultPrevented).toBe(false);
  });
});
