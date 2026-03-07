import { useCallback, useMemo } from "react";
import { AdminService } from "../../../services/adminService";

export function useAdminOrderInteractions({
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
}) {
  const handleRefresh = useCallback(async () => {
    info("Uppdaterar...");
    try {
      await loadOrders(true);
      if (selectedId) {
        await loadOrder(selectedId);
      }
      success("Uppdaterad");
    } catch (err) {
      handleApiError(err, "Uppdatering misslyckades");
    }
  }, [handleApiError, info, loadOrder, loadOrders, selectedId, success]);

  const handleCustomerFilter = useCallback(
    (email) => {
      setFulfillmentFilter("all");
      setDateFilter("all");
      setAmountFilter("all");
      setSearchQuery(email);
      setViewMode("list");
    },
    [setAmountFilter, setDateFilter, setFulfillmentFilter, setSearchQuery, setViewMode]
  );

  const handleExport = useCallback(async () => {
    if (isPreview) {
      info("Demo-läge: export är avstängd.");
      return;
    }
    if (!adminKey) return;
    try {
      const blob = await AdminService.exportOrders(adminKey, {
        limit: 500,
        status: "complete",
        fulfillment: fulfillmentFilter !== "all" ? fulfillmentFilter : "",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success("Export klar");
    } catch (err) {
      setListError(err?.message || "Kunde inte exportera ordrar. Försök igen.");
      handleApiError(err, "Export misslyckades");
    }
  }, [adminKey, fulfillmentFilter, handleApiError, info, isPreview, setListError, success]);

  const handleQuickStatus = useCallback(
    async (event, orderId, status) => {
      event.stopPropagation();
      if (isPreview) {
        info("Demo-läge: ändringar sparas inte.");
        return;
      }
      if (!adminKey) return;

      setQuickActionId(orderId);
      setListError("");
      try {
        await AdminService.updateFulfillment(adminKey, orderId, { status });
        await loadOrders(true);
        if (selectedId === orderId) {
          await loadOrder(orderId);
        }
        success("Order uppdaterad");
      } catch (err) {
        setListError(
          err?.message || "Kunde inte uppdatera statusen. Försök igen."
        );
        handleApiError(err, "Statusändring misslyckades");
      } finally {
        setQuickActionId("");
      }
    },
    [
      adminKey,
      handleApiError,
      info,
      isPreview,
      loadOrder,
      loadOrders,
      selectedId,
      setListError,
      setQuickActionId,
      success,
    ]
  );

  const handleBulkAction = useCallback(
    async (status) => {
      if (selectedOrderIds.size === 0) return;
      if (isPreview) {
        info(`Bulk update: ${selectedOrderIds.size} orders`);
        return;
      }

      const confirmMsg = `Är du säker på att du vill ändra status till "${status}" för ${selectedOrderIds.size} ordrar?`;
      if (!window.confirm(confirmMsg)) return;

      setBulkActionLoading(true);
      try {
        const orderIds = Array.from(selectedOrderIds);
        const results = await Promise.allSettled(
          orderIds.map((id) =>
            AdminService.updateFulfillment(adminKey, id, { status })
          )
        );

        const failedIds = results
          .map((result, index) => ({ result, id: orderIds[index] }))
          .filter((entry) => entry.result.status === "rejected")
          .map((entry) => entry.id);
        const succeeded = orderIds.length - failedIds.length;

        if (succeeded > 0) {
          await loadOrders(true);
        }
        if (failedIds.length === 0) {
          setSelectedOrderIds(new Set());
          success("Massuppdatering klar");
        } else if (succeeded === 0) {
          error("Massuppdatering misslyckades för alla valda ordrar.");
          setListError("Massuppdatering misslyckades. Försök igen.");
        } else {
          setSelectedOrderIds(new Set(failedIds));
          info(
            `Massuppdatering delvis klar: ${succeeded} lyckades, ${failedIds.length} misslyckades.`
          );
        }
      } catch (err) {
        handleApiError(err, "Massuppdatering misslyckades");
      } finally {
        setBulkActionLoading(false);
      }
    },
    [
      adminKey,
      error,
      handleApiError,
      info,
      isPreview,
      loadOrders,
      selectedOrderIds,
      setBulkActionLoading,
      setListError,
      setSelectedOrderIds,
      success,
    ]
  );

  const handleSelectOrder = useCallback(
    (orderId) => {
      if (orderId === selectedId) return;
      if (hasChanges) {
        const shouldSwitch = window.confirm(
          "Du har osparade ändringar. Vill du byta order ändå?"
        );
        if (!shouldSwitch) return;
      }
      setSelectedId(orderId);
      if (isMobile) {
        setViewMode("detail");
      }
    },
    [hasChanges, isMobile, selectedId, setSelectedId, setViewMode]
  );

  const handleSuggestionClick = useCallback(
    (orderId) => {
      setSearchQuery(orderId);
      setSearchFocused(false);
      handleSelectOrder(orderId);
    },
    [handleSelectOrder, setSearchFocused, setSearchQuery]
  );

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (!searchSuggestions || searchSuggestions.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedSuggestion((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedSuggestion((prev) =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        return;
      }

      if (event.key === "Enter" && highlightedSuggestion >= 0) {
        event.preventDefault();
        const suggestion = searchSuggestions[highlightedSuggestion];
        if (suggestion) {
          handleSuggestionClick(suggestion.id);
        }
        return;
      }

      if (event.key === "Tab" && !event.shiftKey && highlightedSuggestion >= 0) {
        const suggestion = searchSuggestions[highlightedSuggestion];
        if (suggestion) {
          handleSuggestionClick(suggestion.id);
        }
      }

      if (event.key === "Escape") {
        setSearchFocused(false);
      }
    },
    [
      handleSuggestionClick,
      highlightedSuggestion,
      searchSuggestions,
      setHighlightedSuggestion,
      setSearchFocused,
    ]
  );

  const customerHistory = useMemo(() => {
    if (!selectedOrder?.customerEmail) return null;
    const matches = orders.filter(
      (order) =>
        order.customerEmail === selectedOrder.customerEmail &&
        order.id !== selectedId
    );
    const total = matches.reduce(
      (sum, order) => sum + (order.amountTotal || 0),
      0
    );
    return {
      count: matches.length,
      total,
    };
  }, [orders, selectedId, selectedOrder]);

  return {
    handleRefresh,
    handleCustomerFilter,
    handleExport,
    handleQuickStatus,
    handleBulkAction,
    handleSelectOrder,
    handleSuggestionClick,
    handleSearchKeyDown,
    customerHistory,
  };
}
