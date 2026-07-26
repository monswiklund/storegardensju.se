import { act, renderHook } from "@testing-library/react";
import { IDLE_TIMEOUT_MS } from "../adminAuthConstants";
import { useAdminInactivityTimeout } from "./useAdminInactivityTimeout";

describe("useAdminInactivityTimeout", () => {
  it("uses the latest callback without re-registering activity listeners", () => {
    vi.useFakeTimers();
    const addEventListener = vi.spyOn(window, "addEventListener");
    const firstTimeout = vi.fn();
    const latestTimeout = vi.fn();

    const { rerender } = renderHook(
      ({ onTimeout }) =>
        useAdminInactivityTimeout({
          active: true,
          onTimeout,
        }),
      { initialProps: { onTimeout: firstTimeout } }
    );

    const activityRegistrations = () =>
      addEventListener.mock.calls.filter(([event]) =>
        ["mousemove", "keydown", "pointerdown", "touchstart"].includes(event)
      ).length;

    expect(activityRegistrations()).toBe(4);

    rerender({ onTimeout: latestTimeout });

    expect(activityRegistrations()).toBe(4);

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS);
    });

    expect(firstTimeout).not.toHaveBeenCalled();
    expect(latestTimeout).toHaveBeenCalledTimes(1);

    addEventListener.mockRestore();
    vi.useRealTimers();
  });
});
