import { renderHook, act } from "@testing-library/react";
import { useAdminOrderInteractions } from "./useAdminOrderInteractions";
import { AdminService } from "../../../services/adminService";

vi.mock("../../../services/adminService", () => ({
  AdminService: {
    exportOrders: vi.fn(),
    updateFulfillment: vi.fn(),
  },
}));

function createBaseProps(overrides = {}) {
  return {
    adminKey: "session",
    isPreview: false,
    selectedId: "ord_1",
    setSelectedId: vi.fn(),
    isMobile: false,
    setViewMode: vi.fn(),
    hasChanges: false,
    orders: [
      { id: "ord_1", customerEmail: "a@example.com", amountTotal: 1000 },
      { id: "ord_2", customerEmail: "a@example.com", amountTotal: 2000 },
      { id: "ord_3", customerEmail: "b@example.com", amountTotal: 3000 },
    ],
    selectedOrder: { id: "ord_1", customerEmail: "a@example.com" },
    loadOrders: vi.fn().mockResolvedValue(undefined),
    loadOrder: vi.fn().mockResolvedValue(undefined),
    selectedOrderIds: new Set(["ord_1", "ord_2"]),
    setSelectedOrderIds: vi.fn(),
    setBulkActionLoading: vi.fn(),
    setQuickActionId: vi.fn(),
    setListError: vi.fn(),
    searchSuggestions: [{ id: "ord_2" }, { id: "ord_3" }],
    highlightedSuggestion: 0,
    setSearchQuery: vi.fn(),
    setSearchFocused: vi.fn(),
    setHighlightedSuggestion: vi.fn(),
    fulfillmentFilter: "all",
    setFulfillmentFilter: vi.fn(),
    setDateFilter: vi.fn(),
    setAmountFilter: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    handleApiError: vi.fn(),
    ...overrides,
  };
}

describe("useAdminOrderInteractions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports orders with current fulfillment filter", async () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    const appendChild = vi.spyOn(document.body, "appendChild");
    const removeChild = vi.spyOn(document.body, "removeChild");
    const createElement = document.createElement.bind(document);
    const anchor = createElement("a");
    const click = vi.spyOn(anchor, "click").mockImplementation(() => {});
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      if (tagName === "a") {
        return anchor;
      }
      return createElement(tagName, options);
    });

    AdminService.exportOrders.mockResolvedValue(new Blob(["csv"]));
    const props = createBaseProps({ fulfillmentFilter: "ship" });

    const { result } = renderHook(() => useAdminOrderInteractions(props));

    await act(async () => {
      await result.current.handleExport();
    });

    expect(AdminService.exportOrders).toHaveBeenCalledWith("session", {
      limit: 500,
      status: "complete",
      fulfillment: "ship",
    });
    expect(click).toHaveBeenCalled();
    expect(props.success).toHaveBeenCalledWith("Export klar");
    appendChild.mockRestore();
    removeChild.mockRestore();
    document.createElement.mockRestore();
    click.mockRestore();
  });

  it("bulk action keeps only failed ids on partial failure", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    AdminService.updateFulfillment
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("fail"));

    const props = createBaseProps();
    const { result } = renderHook(() => useAdminOrderInteractions(props));

    await act(async () => {
      await result.current.handleBulkAction("ship");
    });

    expect(props.setBulkActionLoading).toHaveBeenNthCalledWith(1, true);
    expect(props.setSelectedOrderIds).toHaveBeenCalledWith(new Set(["ord_2"]));
    expect(props.info).toHaveBeenCalledWith(
      "Massuppdatering delvis klar: 1 lyckades, 1 misslyckades."
    );
    expect(props.setBulkActionLoading).toHaveBeenLastCalledWith(false);
  });
});
