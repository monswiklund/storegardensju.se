import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminCoupons from "./AdminCoupons";
import { AdminService } from "../../../services/adminService";

const toast = {
  success: vi.fn(),
  error: vi.fn(),
};

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => toast,
}));

vi.mock("../../../services/adminService", () => ({
  AdminService: {
    getCoupons: vi.fn(),
    createCoupon: vi.fn(),
    archiveCoupon: vi.fn(),
  },
}));

describe("AdminCoupons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AdminService.getCoupons.mockResolvedValue([]);
  });

  it("requests inactive coupons when filter changes", async () => {
    render(<AdminCoupons adminKey="session" />);

    await waitFor(() => {
      expect(AdminService.getCoupons).toHaveBeenCalledWith("session", {});
    });

    fireEvent.change(screen.getAllByRole("combobox")[1], {
      target: { value: "inactive" },
    });

    await waitFor(() => {
      expect(AdminService.getCoupons).toHaveBeenLastCalledWith("session", {
        active: "false",
      });
    });
  });
});
