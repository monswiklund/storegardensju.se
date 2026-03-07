import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminProductList from "./AdminProductList";
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
    getProducts: vi.fn(),
    archiveProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));

const products = [
  {
    id: "prod_1",
    name: "Vas",
    category: "Keramik",
    price: 10000,
    stock: 2,
    active: true,
  },
  {
    id: "prod_2",
    name: "Ljus",
    category: "Dekor",
    price: 5000,
    stock: 1,
    active: true,
  },
];

describe("AdminProductList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    AdminService.getProducts.mockImplementation(async (_adminKey, params = {}) => {
      if (params.archived === "true") {
        return [];
      }
      return products;
    });
  });

  it("keeps only failed products selected after partial bulk archive failure", async () => {
    AdminService.archiveProduct
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("fail"));

    render(<AdminProductList adminKey="session" onEdit={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText("Vas").length).toBeGreaterThan(0);
    });

    const rowCheckboxes = document.querySelectorAll("tbody input[type='checkbox']");
    fireEvent.click(rowCheckboxes[1]);
    fireEvent.click(rowCheckboxes[0]);
    fireEvent.click(screen.getByRole("button", { name: "Arkivera valda" }));

    await waitFor(() => {
      expect(AdminService.archiveProduct).toHaveBeenCalledTimes(2);
    });

    const refreshedCheckboxes = Array.from(
      document.querySelectorAll("tbody input[type='checkbox']")
    );
    expect(refreshedCheckboxes.filter((checkbox) => checkbox.checked)).toHaveLength(1);
  });
});
