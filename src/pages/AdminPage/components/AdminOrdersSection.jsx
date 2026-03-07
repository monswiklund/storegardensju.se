import AdminOrderList from "./AdminOrderList";
import AdminOrderDetail from "./AdminOrderDetail";

export default function AdminOrdersSection({
  showOrdersSection,
  adminView,
  isMobile,
  viewMode,
  setViewMode,
  filteredOrders,
  selectedId,
  onSelectOrder,
  onExport,
  sortMode,
  setSortMode,
  listLoading,
  listError,
  fulfillmentFilter,
  setFulfillmentFilter,
  dateFilter,
  setDateFilter,
  amountFilter,
  setAmountFilter,
  counts,
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  handleSearchKeyDown,
  searchSuggestions,
  onSuggestionClick,
  highlightedSuggestion,
  handleQuickStatus,
  quickActionId,
  ordersCount,
  hasMore,
  onLoadMore,
  selectedOrderIds,
  onToggleSelect,
  onSelectAll,
  onBulkAction,
  bulkActionLoading,
  onClearFilters,
  onCopy,
  order,
  detailLoading,
  detailError,
  customerHistory,
  copiedField,
  editState,
  onSave,
  onReset,
  onRefund,
  hasChanges,
  isBackwardStatus,
  saveStatus,
  onCustomerFilter,
}) {
  if (!showOrdersSection) {
    return null;
  }

  return (
    <>
      {isMobile && (
        <div className="admin-mobile-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            Ordrar
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${viewMode === "detail" ? "active" : ""}`}
            onClick={() => setViewMode("detail")}
            disabled={!selectedId}
          >
            Detaljer
          </button>
        </div>
      )}

      <div className={`admin-panels ${adminView === "overview" ? "overview-mode" : ""}`}>
        <AdminOrderList
          adminView={adminView}
          filteredOrders={filteredOrders}
          selectedId={selectedId}
          onSelectOrder={onSelectOrder}
          onExport={onExport}
          sortMode={sortMode}
          setSortMode={setSortMode}
          listLoading={listLoading}
          listError={listError}
          fulfillmentFilter={fulfillmentFilter}
          setFulfillmentFilter={setFulfillmentFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          amountFilter={amountFilter}
          setAmountFilter={setAmountFilter}
          counts={counts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchFocused={searchFocused}
          setSearchFocused={setSearchFocused}
          handleSearchKeyDown={handleSearchKeyDown}
          searchSuggestions={searchSuggestions}
          onSuggestionClick={onSuggestionClick}
          highlightedSuggestion={highlightedSuggestion}
          handleQuickStatus={handleQuickStatus}
          quickActionId={quickActionId}
          isMobile={isMobile}
          viewMode={viewMode}
          ordersCount={ordersCount}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          selectedOrderIds={selectedOrderIds}
          onToggleSelect={onToggleSelect}
          onSelectAll={onSelectAll}
          onBulkAction={onBulkAction}
          bulkActionLoading={bulkActionLoading}
          onClearFilters={onClearFilters}
          onCopy={onCopy}
        />

        <AdminOrderDetail
          order={order}
          loading={detailLoading}
          error={detailError}
          customerHistory={customerHistory}
          onCopy={onCopy}
          copiedField={copiedField}
          editState={editState}
          onSave={onSave}
          onReset={onReset}
          onRefund={onRefund}
          hasChanges={hasChanges}
          isBackwardStatus={isBackwardStatus}
          saveStatus={saveStatus}
          isMobile={isMobile}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCustomerFilter={onCustomerFilter}
        />
      </div>
    </>
  );
}
