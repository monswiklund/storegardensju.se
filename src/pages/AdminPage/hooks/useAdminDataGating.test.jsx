import { renderHook } from "@testing-library/react";
import { AdminService } from "../../../services/adminService";
import { useAdminOrders } from "./useAdminOrders";
import { useAdminStats } from "./useAdminStats";

vi.mock("../../../services/adminService", () => ({
  AdminService: {
    getOrders: vi.fn(),
    getStats: vi.fn(),
  },
}));

describe("admin data gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("V10 does not fetch hidden orders or stats", () => {
    const common = {
      adminKey: "session",
      isPreview: false,
      handleApiError: vi.fn(),
    };

    renderHook(() =>
      useAdminOrders({
        ...common,
        demoOrders: [],
        enabled: false,
      })
    );
    renderHook(() =>
      useAdminStats({
        ...common,
        demoStats: {},
        statsRange: "90",
        enabled: false,
      })
    );

    expect(AdminService.getOrders).not.toHaveBeenCalled();
    expect(AdminService.getStats).not.toHaveBeenCalled();
  });
});
