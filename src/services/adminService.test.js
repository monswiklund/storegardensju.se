import { AdminService } from "./adminService";

describe("AdminService.getOrders", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it("normalizes startingAfter to starting_after in the request query", async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(
        JSON.stringify({
          ok: true,
          data: { data: [], has_more: false },
        })
      ),
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    });

    await AdminService.getOrders("session", {
      limit: 50,
      status: "complete",
      startingAfter: "ord_99",
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("/admin/orders?");
    expect(url).toContain("starting_after=ord_99");
    expect(url).not.toContain("startingAfter=");
    expect(options.credentials).toBe("include");
  });
});
