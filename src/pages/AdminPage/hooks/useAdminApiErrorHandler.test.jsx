import { renderHook } from "@testing-library/react";
import { useAdminApiErrorHandler } from "./useAdminApiErrorHandler";

function createDeps() {
  return {
    error: vi.fn(),
    resetShellState: vi.fn(),
    setAdminKey: vi.fn(),
    setPreviewMode: vi.fn(),
    setRequiresAccessLogin: vi.fn(),
  };
}

describe("useAdminApiErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resets shell state on 401/403", () => {
    const deps = createDeps();
    const { result } = renderHook(() => useAdminApiErrorHandler(deps));

    result.current({ status: 401, message: "Unauthorized" }, "Orders");

    expect(deps.error).toHaveBeenCalledWith(
      "Sessionen har löpt ut eller saknar behörighet. Loggar ut..."
    );
    expect(deps.resetShellState).toHaveBeenCalled();
    expect(deps.setAdminKey).not.toHaveBeenCalled();
  });

  it("switches to access-login state on network auth failure", () => {
    const deps = createDeps();
    const { result } = renderHook(() => useAdminApiErrorHandler(deps));

    result.current(new Error("Failed to fetch"), "Orders");

    expect(deps.setRequiresAccessLogin).toHaveBeenCalledWith(true);
    expect(deps.setAdminKey).toHaveBeenCalledWith("");
    expect(deps.setPreviewMode).toHaveBeenCalledWith(false);
    expect(deps.error).toHaveBeenCalledWith(
      "Inloggning via Cloudflare Access krävs. Öppna Access-login och försök igen."
    );
  });
});
