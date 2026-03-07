import { act, renderHook, waitFor } from "@testing-library/react";
import { useAdminShell } from "./useAdminShell";

vi.mock("../../../config/apiBaseUrl", () => ({
  getApiBaseUrl: vi.fn(() => "https://api.example.com"),
}));

function installMatchMedia(matches) {
  const listeners = new Set();
  const mediaQuery = {
    matches,
    media: "(max-width: 900px)",
    addEventListener: vi.fn((event, callback) => {
      if (event === "change") {
        listeners.add(callback);
      }
    }),
    removeEventListener: vi.fn((event, callback) => {
      if (event === "change") {
        listeners.delete(callback);
      }
    }),
  };

  window.matchMedia = vi.fn(() => mediaQuery);

  return {
    mediaQuery,
    emit(nextMatches) {
      mediaQuery.matches = nextMatches;
      listeners.forEach((callback) => callback({ matches: nextMatches }));
    },
  };
}

function createProps(overrides = {}) {
  return {
    initialAdminKey: "session",
    searchParams: new URLSearchParams("view=orders"),
    setSearchParams: vi.fn(),
    ...overrides,
  };
}

describe("useAdminShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes invalid view params and syncs selected order from url", async () => {
    installMatchMedia(false);
    const setSearchParams = vi.fn();

    const { result } = renderHook(() =>
      useAdminShell(
        createProps({
          searchParams: new URLSearchParams("view=invalid&order=ord_77"),
          setSearchParams,
        })
      )
    );

    await waitFor(() => {
      expect(result.current.selectedId).toBe("ord_77");
    });

    expect(result.current.adminView).toBe("overview");
    expect(setSearchParams).toHaveBeenCalled();
    const [nextParams, options] = setSearchParams.mock.calls.at(-1);
    expect(nextParams.get("view")).toBe("overview");
    expect(nextParams.get("order")).toBe("ord_77");
    expect(options).toEqual({ replace: true });
  });

  it("keeps mobile list/detail state in sync with selected order and escape", async () => {
    installMatchMedia(true);
    const setSearchParams = vi.fn();

    const { result } = renderHook(() =>
      useAdminShell(
        createProps({
          searchParams: new URLSearchParams("view=orders"),
          setSearchParams,
        })
      )
    );

    await waitFor(() => {
      expect(result.current.isMobile).toBe(true);
      expect(result.current.viewMode).toBe("list");
    });

    act(() => {
      result.current.setSelectedId("ord_1");
    });

    await waitFor(() => {
      expect(result.current.viewMode).toBe("detail");
    });

    const keyboardEvent = new KeyboardEvent("keydown", { key: "Escape" });
    act(() => {
      window.dispatchEvent(keyboardEvent);
    });

    await waitFor(() => {
      expect(result.current.selectedId).toBe("");
      expect(result.current.viewMode).toBe("list");
    });
  });

  it("resets shell state explicitly", async () => {
    const { emit } = installMatchMedia(false);

    const { result } = renderHook(() => useAdminShell(createProps()));

    await waitFor(() => {
      expect(result.current.viewMode).toBe("detail");
    });

    act(() => {
      result.current.setRequiresAccessLogin(true);
      result.current.setPreviewMode(true);
      result.current.setSelectedId("ord_22");
    });

    act(() => {
      emit(true);
    });

    await waitFor(() => {
      expect(result.current.isMobile).toBe(true);
      expect(result.current.viewMode).toBe("detail");
    });

    act(() => {
      result.current.resetShellState();
    });

    expect(result.current.adminKey).toBe("");
    expect(result.current.requiresAccessLogin).toBe(false);
    expect(result.current.previewMode).toBe(false);
    expect(result.current.selectedId).toBe("");
  });
});
