import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import AdminOrdersSection from "./AdminOrdersSection";
import { useAdminOrderInteractions } from "../hooks/useAdminOrderInteractions";
import { AdminService } from "../../../services/adminService";

vi.mock("../../../services/adminService", () => ({
  AdminService: {
    exportOrders: vi.fn(),
    updateFulfillment: vi.fn(),
  },
}));

function OrdersSectionHarness() {
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set(["ord_1", "ord_2"]));
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  const orders = [
    { id: "ord_1", created: 1000, amountTotal: 1000, customerEmail: "a@example.com", fulfillment: "new", paymentStatus: "paid" },
    { id: "ord_2", created: 900, amountTotal: 2000, customerEmail: "b@example.com", fulfillment: "new", paymentStatus: "paid" },
  ];

  const interactions = useAdminOrderInteractions({
    adminKey: "session",
    isPreview: false,
    selectedId,
    setSelectedId,
    isMobile: false,
    setViewMode: vi.fn(),
    hasChanges: false,
    orders,
    selectedOrder: null,
    loadOrders: vi.fn().mockResolvedValue(undefined),
    loadOrder: vi.fn().mockResolvedValue(undefined),
    selectedOrderIds,
    setSelectedOrderIds,
    setBulkActionLoading,
    setQuickActionId: vi.fn(),
    setListError,
    searchSuggestions: [],
    highlightedSuggestion,
    setSearchQuery,
    setSearchFocused,
    setHighlightedSuggestion,
    fulfillmentFilter,
    setFulfillmentFilter,
    setDateFilter,
    setAmountFilter,
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    handleApiError: vi.fn(),
  });

  return (
    <>
      {listError && <p>{listError}</p>}
      <AdminOrdersSection
        showOrdersSection
        adminView="orders"
        isMobile={false}
        viewMode="list"
        setViewMode={vi.fn()}
        filteredOrders={orders}
        selectedId={selectedId}
        onSelectOrder={interactions.handleSelectOrder}
        onExport={interactions.handleExport}
        sortMode="event"
        setSortMode={vi.fn()}
        listLoading={false}
        listError={listError}
        fulfillmentFilter={fulfillmentFilter}
        setFulfillmentFilter={setFulfillmentFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        amountFilter={amountFilter}
        setAmountFilter={setAmountFilter}
        counts={{ all: 2, new: 2, ship: 0, pickup_ready: 0, completed: 0 }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        handleSearchKeyDown={interactions.handleSearchKeyDown}
        searchSuggestions={[]}
        onSuggestionClick={interactions.handleSuggestionClick}
        highlightedSuggestion={highlightedSuggestion}
        handleQuickStatus={interactions.handleQuickStatus}
        quickActionId=""
        ordersCount={2}
        hasMore={false}
        onLoadMore={vi.fn()}
        selectedOrderIds={selectedOrderIds}
        onToggleSelect={vi.fn()}
        onSelectAll={vi.fn()}
        onBulkAction={interactions.handleBulkAction}
        bulkActionLoading={bulkActionLoading}
        onClearFilters={vi.fn()}
        onCopy={vi.fn()}
        order={null}
        detailLoading={false}
        detailError=""
        customerHistory={null}
        copiedField=""
        editState={{
          status: "new",
          setStatus: vi.fn(),
          note: "",
          setNote: vi.fn(),
          trackingNumber: "",
          setTrackingNumber: vi.fn(),
          trackingCarrier: "auto",
          setTrackingCarrier: vi.fn(),
        }}
        onSave={vi.fn()}
        onReset={vi.fn()}
        onRefund={vi.fn()}
        hasChanges={false}
        isBackwardStatus={false}
        saveStatus={{ loading: false, error: "" }}
        onCustomerFilter={interactions.handleCustomerFilter}
      />
    </>
  );
}

describe("AdminOrdersSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("keeps only failed selections after partial bulk failure through the UI", async () => {
    AdminService.updateFulfillment
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("fail"));

    render(<OrdersSectionHarness />);

    expect(screen.getByText("2 valda")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: 'Markera "Att skicka"' }));

    await waitFor(() => {
      expect(screen.getByText("1 valda")).toBeInTheDocument();
    });
  });
});
