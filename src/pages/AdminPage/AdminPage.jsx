import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminService } from "../../services/adminService";
import "./AdminPage.css";
import {
  DEFAULT_STATS_RANGE,
  DEMO_ORDERS,
  DEMO_DETAILS,
  buildDemoStats,
} from "./adminConstants";
import { useToast } from "../../contexts/ToastContext";
import AdminLogin from "./components/AdminLogin";
import AdminHeader from "./components/AdminHeader";
import AdminStats from "./components/AdminStats";
import AdminPackingSlip from "./components/AdminPackingSlip";
import AdminSidebar from "./components/AdminSidebar";
import AdminFeatureSections from "./components/AdminFeatureSections";
import AdminOrdersSection from "./components/AdminOrdersSection";
import { PageSection } from "../../components";
import { useAdminOrders } from "./hooks/useAdminOrders";
import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminOrderDetail } from "./hooks/useAdminOrderDetail";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminClipboard } from "./hooks/useAdminClipboard";
import { useAdminOrderInteractions } from "./hooks/useAdminOrderInteractions";
import { useAdminApiErrorHandler } from "./hooks/useAdminApiErrorHandler";

function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isLocalDev =
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const devAdminKey = (import.meta.env.VITE_ADMIN_DEV_KEY || "").trim();
  const initialAdminKey = isLocalDev && devAdminKey ? devAdminKey : "session";

  const { success, error, info } = useToast();

  const [statsRange, setStatsRange] = useState(DEFAULT_STATS_RANGE);

  // Product Management
  const [productViewMode, setProductViewMode] = useState("list"); // list, create, edit
  const [editingProduct, setEditingProduct] = useState(null);

  const demoStats = useMemo(() => buildDemoStats(statsRange), [statsRange]);

  const {
    adminKey,
    setAdminKey,
    requiresAccessLogin,
    setRequiresAccessLogin,
    previewMode,
    setPreviewMode,
    isPreview,
    isSidebarOpen,
    setIsSidebarOpen,
    selectedId,
    setSelectedId,
    isMobile,
    viewMode,
    setViewMode,
    adminView,
    resetShellState,
    handleOpenAccessLogin,
    handleSwitchAccount,
    handleAdminViewChange,
  } = useAdminShell({
    initialAdminKey,
    searchParams,
    setSearchParams,
  });

  const handleApiError = useAdminApiErrorHandler({
    error,
    resetShellState,
    setAdminKey,
    setPreviewMode,
    setRequiresAccessLogin,
  });

  const {
    orders,
    hasMore,
    listLoading,
    listError,
    setListError,
    fulfillmentFilter,
    setFulfillmentFilter,
    dateFilter,
    setDateFilter,
    amountFilter,
    setAmountFilter,
    searchQuery,
    setSearchQuery,
    searchFocused,
    setSearchFocused,
    highlightedSuggestion,
    setHighlightedSuggestion,
    sortMode,
    setSortMode,
    selectedOrderIds,
    setSelectedOrderIds,
    bulkActionLoading,
    setBulkActionLoading,
    quickActionId,
    setQuickActionId,
    counts,
    filteredOrders,
    searchSuggestions,
    loadOrders,
    handleToggleSelect,
    handleSelectAll,
    handleClearFilters,
    resetOrdersState,
  } = useAdminOrders({
    adminKey,
    isPreview,
    demoOrders: DEMO_ORDERS,
    handleApiError,
  });

  const {
    statsExpanded,
    setStatsExpanded,
    categoryExpanded,
    setCategoryExpanded,
    statsLoading,
    statsError,
    statsSummary,
    resetStatsState,
  } = useAdminStats({
    adminKey,
    isPreview,
    demoStats,
    statsRange,
    handleApiError,
  });

  const {
    selectedOrder,
    detailLoading,
    detailError,
    editState,
    saveStatus,
    hasChanges,
    isBackwardStatus,
    loadOrder,
    handleSave,
    handleRefund,
    handleReset,
    resetDetailState,
  } = useAdminOrderDetail({
    adminKey,
    isPreview,
    selectedId,
    demoDetails: DEMO_DETAILS,
    loadOrders,
    handleApiError,
    success,
    error,
    info,
  });

  const { copiedField, handleCopyText } = useAdminClipboard({
    success,
  });

  const handleLogout = useCallback(() => {
    resetShellState();
    resetOrdersState();
    resetStatsState();
    resetDetailState();
  }, [resetDetailState, resetOrdersState, resetShellState, resetStatsState]);

  useEffect(() => {
    if (!adminKey && !previewMode) {
      resetOrdersState();
      resetStatsState();
      resetDetailState();
    }
  }, [adminKey, previewMode, resetDetailState, resetOrdersState, resetStatsState]);

  const {
    handleRefresh,
    handleCustomerFilter,
    handleExport,
    handleQuickStatus,
    handleBulkAction,
    handleSelectOrder,
    handleSuggestionClick,
    handleSearchKeyDown,
    customerHistory,
  } = useAdminOrderInteractions({
    adminKey,
    isPreview,
    selectedId,
    setSelectedId,
    isMobile,
    setViewMode,
    hasChanges,
    orders,
    selectedOrder,
    loadOrders,
    loadOrder,
    selectedOrderIds,
    setSelectedOrderIds,
    setBulkActionLoading,
    setQuickActionId,
    setListError,
    searchSuggestions,
    highlightedSuggestion,
    setSearchQuery,
    setSearchFocused,
    setHighlightedSuggestion,
    fulfillmentFilter,
    setFulfillmentFilter,
    setDateFilter,
    setAmountFilter,
    success,
    error,
    info,
    handleApiError,
  });

  const showStatsSection = adminView === "overview" || adminView === "stats";
  const showOrdersSection = adminView === "overview" || adminView === "orders";
  const showCustomersSection = adminView === "customers";
  const showProductsSection = adminView === "products";
  const showEventsSection = adminView === "events";
  const showGallerySection = adminView === "gallery";

  const showCouponsSection = adminView === "coupons";

  useEffect(() => {
    if (filteredOrders.length === 0 && !searchQuery) {
      // Logic for selecting first order only if not searching (searching might filter all out)
    }

    if (filteredOrders.length > 0 && !selectedId && !isMobile) {
      setSelectedId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedId, isMobile, searchQuery]);

  if (!adminKey && !previewMode) {
    return (
      <AdminLogin
        error={
          listError ||
          (requiresAccessLogin
            ? "Cloudflare Access-session saknas. Logga in via Access och försök igen."
            : "")
        }
        onRetry={() => {
          setRequiresAccessLogin(false);
          setAdminKey("session");
        }}
        onOpenAccess={handleOpenAccessLogin}
        onPreview={() => setPreviewMode(true)}
      />
    );
  }

  return (
    <main role="main" id="main-content">
      {!isSidebarOpen && (
        <button 
          className="admin-fixed-hamburger" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Öppna admin-meny"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
      <PageSection background="alt" spacing="default">
        <div className="admin-layout">
          <AdminSidebar 
            adminView={adminView} 
            onViewChange={handleAdminViewChange}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <div className="admin-container">
            <AdminHeader
              isPreview={isPreview}
              listLoading={listLoading}
              onRefresh={handleRefresh}
              onSwitchAccount={handleSwitchAccount}
              adminView={adminView}
              onViewChange={handleAdminViewChange}
              onToggleSidebar={() => setIsSidebarOpen(true)}
            />

            <AdminPackingSlip order={selectedOrder} />

            {showStatsSection && (
              <AdminStats
                adminView={adminView}
                statsRange={statsRange}
                setStatsRange={setStatsRange}
                statsExpanded={statsExpanded}
                setStatsExpanded={setStatsExpanded}
                statsLoading={statsLoading}
                statsError={statsError}
                statsSummary={statsSummary}
                categoryExpanded={categoryExpanded}
                setCategoryExpanded={setCategoryExpanded}
              />
            )}

            <AdminFeatureSections
              showCustomersSection={showCustomersSection}
              showProductsSection={showProductsSection}
              showGallerySection={showGallerySection}
              showEventsSection={showEventsSection}
              showCouponsSection={showCouponsSection}
              orders={orders}
              listLoading={listLoading}
              isPreview={isPreview}
              adminKey={adminKey}
              onLogin={handleLogout}
              productViewMode={productViewMode}
              setProductViewMode={setProductViewMode}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
            />

            <AdminOrdersSection
              showOrdersSection={showOrdersSection}
              adminView={adminView}
              isMobile={isMobile}
              viewMode={viewMode}
              setViewMode={setViewMode}
              filteredOrders={filteredOrders}
              selectedId={selectedId}
              onSelectOrder={handleSelectOrder}
              onExport={handleExport}
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
              onSuggestionClick={handleSuggestionClick}
              highlightedSuggestion={highlightedSuggestion}
              handleQuickStatus={handleQuickStatus}
              quickActionId={quickActionId}
              ordersCount={orders.length}
              hasMore={hasMore}
              onLoadMore={() => loadOrders(false)}
              selectedOrderIds={selectedOrderIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onBulkAction={handleBulkAction}
              bulkActionLoading={bulkActionLoading}
              onClearFilters={handleClearFilters}
              onCopy={handleCopyText}
              order={selectedOrder}
              detailLoading={detailLoading}
              detailError={detailError}
              customerHistory={customerHistory}
              copiedField={copiedField}
              editState={editState}
              onSave={handleSave}
              onReset={handleReset}
              onRefund={handleRefund}
              hasChanges={hasChanges}
              isBackwardStatus={isBackwardStatus}
              saveStatus={saveStatus}
              onCustomerFilter={handleCustomerFilter}
            />
          </div>
        </div>
      </PageSection>
    </main>
  );
}

export default AdminPage;
