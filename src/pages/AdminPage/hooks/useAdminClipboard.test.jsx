import { renderHook, act } from "@testing-library/react";
import { useAdminClipboard } from "./useAdminClipboard";

describe("useAdminClipboard", () => {
  it("copies text and clears copied field after timeout", async () => {
    vi.useFakeTimers();

    const success = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const { result } = renderHook(() => useAdminClipboard({ success }));

    await act(async () => {
      await result.current.handleCopyText("hello", "email");
    });

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(success).toHaveBeenCalledWith("Kopierat!");
    expect(result.current.copiedField).toBe("email");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(result.current.copiedField).toBe("");

    vi.useRealTimers();
  });
});
