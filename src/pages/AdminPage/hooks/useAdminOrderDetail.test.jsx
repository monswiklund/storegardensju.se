import { renderHook, act, waitFor } from "@testing-library/react";
import { useAdminOrderDetail } from "./useAdminOrderDetail";
import { AdminService } from "../../../services/adminService";

vi.mock("../../../services/adminService", () => ({
  AdminService: {
    getOrder: vi.fn(),
    updateFulfillment: vi.fn(),
    refundOrder: vi.fn(),
  },
}));

function createProps(overrides = {}) {
  return {
    adminKey: "session",
    isPreview: false,
    selectedId: "ord_1",
    demoDetails: {},
    loadOrders: vi.fn().mockResolvedValue(undefined),
    handleApiError: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    ...overrides,
  };
}

describe("useAdminOrderDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads order and autosaves pure status change", async () => {
    AdminService.getOrder.mockResolvedValue({
      id: "ord_1",
      fulfillment: "new",
      adminNote: "",
      trackingNumber: "",
      trackingCarrier: "auto",
    });
    AdminService.updateFulfillment.mockResolvedValue({});

    const props = createProps();
    const { result } = renderHook(() => useAdminOrderDetail(props));

    await waitFor(() => {
      expect(AdminService.getOrder).toHaveBeenCalledWith("session", "ord_1");
      expect(result.current.selectedOrder?.id).toBe("ord_1");
    });

    act(() => {
      result.current.editState.setStatus("ship");
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 750));
    });

    await waitFor(() => {
      expect(AdminService.updateFulfillment).toHaveBeenCalledWith("session", "ord_1", {
        status: "ship",
        note: undefined,
        trackingNumber: undefined,
        trackingCarrier: undefined,
      });
    });
  });

  it("refunds selected order after prompt and confirm", async () => {
    AdminService.getOrder.mockResolvedValue({
      id: "ord_1",
      fulfillment: "new",
      adminNote: "",
      trackingNumber: "",
      trackingCarrier: "auto",
    });
    AdminService.refundOrder.mockResolvedValue({});

    vi.spyOn(window, "prompt").mockReturnValue("100");
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const props = createProps();
    const { result } = renderHook(() => useAdminOrderDetail(props));

    await waitFor(() => {
      expect(AdminService.getOrder).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.handleRefund();
    });

    expect(AdminService.refundOrder).toHaveBeenCalledWith("session", "ord_1", 10000);
    expect(props.loadOrders).toHaveBeenCalledWith(true);
    expect(props.success).toHaveBeenCalledWith("Återbetalat 100 kr");
  });
});
