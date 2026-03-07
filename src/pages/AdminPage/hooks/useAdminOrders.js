import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminService } from "../../../services/adminService";
import { useDebounce } from "../../../hooks/useDebounce";
import { DEFAULT_FILTER, SORT_STORAGE_KEY } from "../adminConstants";

export function useAdminOrders({ adminKey, isPreview, demoOrders, handleApiError }) {
  const ordersRequestRef = useRef(0);
  const lastOrderCursorRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState(DEFAULT_FILTER);
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [quickActionId, setQuickActionId] = useState("");
  const [sortMode, setSortMode] = useState(() => {
    if (typeof window === "undefined") return "event";
    return localStorage.getItem(SORT_STORAGE_KEY) || "event";
  });

  const loadOrders = useCallback(
    async (reset = true) => {
      if (!adminKey && !isPreview) return;
      const requestId = ++ordersRequestRef.current;
      setListLoading(true);
      setListError("");
      try {
        if (isPreview) {
          if (requestId !== ordersRequestRef.current) return;
          setOrders(demoOrders);
          setHasMore(false);
          setLastOrderCursor(null);
        } else {
          const params = {
            limit: 50,
            status: "complete",
          };
          if (!reset && lastOrderCursorRef.current) {
            params.starting_after = lastOrderCursorRef.current;
          }
          const data = await AdminService.getOrders(adminKey, params);
          if (requestId !== ordersRequestRef.current) return;

          const newOrders = Array.isArray(data?.data) ? data.data : [];
          if (reset) {
            setOrders(newOrders);
          } else {
            setOrders((prev) => [...prev, ...newOrders]);
          }
          setHasMore(Boolean(data?.has_more || data?.hasMore));
          if (newOrders.length > 0) {
            lastOrderCursorRef.current = newOrders[newOrders.length - 1].id;
          } else if (reset) {
            lastOrderCursorRef.current = null;
          }
        }
      } catch (err) {
        if (requestId !== ordersRequestRef.current) return;
        setListError(err?.message || "Kunde inte hämta ordrar. Försök igen.");
        handleApiError(err, "Misslyckades att hämta ordrar");
      } finally {
        if (requestId === ordersRequestRef.current) {
          setListLoading(false);
        }
      }
    },
    [adminKey, demoOrders, handleApiError, isPreview]
  );

  useEffect(() => {
    if (adminKey || isPreview) {
      loadOrders(true);
    }
  }, [adminKey, isPreview, loadOrders]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SORT_STORAGE_KEY, sortMode);
  }, [sortMode]);

  const sortedOrders = useMemo(() => {
    const nextOrders = [...orders];
    if (sortMode === "event") {
      nextOrders.sort((a, b) => {
        const aKey = a.lastEventAt || a.fulfillmentUpdatedAt || a.created || 0;
        const bKey = b.lastEventAt || b.fulfillmentUpdatedAt || b.created || 0;
        return bKey - aKey;
      });
      return nextOrders;
    }
    return nextOrders.sort((a, b) => b.created - a.created);
  }, [orders, sortMode]);

  const counts = useMemo(() => {
    const result = {
      all: orders.length,
      new: 0,
      ship: 0,
      pickup_ready: 0,
      completed: 0,
    };

    orders.forEach((order) => {
      const status = order.fulfillment || "new";
      if (result[status] !== undefined) {
        result[status] += 1;
      }
    });

    return result;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();

    return sortedOrders.filter((order) => {
      const matchesFulfillment =
        fulfillmentFilter === "all" ||
        (order.fulfillment || "new") === fulfillmentFilter;
      if (!matchesFulfillment) return false;

      if (dateFilter !== "all") {
        const createdDate = new Date(order.created * 1000);
        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (dateFilter === "today") {
          if (createdDate < startOfDay) return false;
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (createdDate < weekAgo) return false;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (createdDate < monthAgo) return false;
        }
      }

      if (amountFilter !== "all") {
        const amount = (order.amountTotal || 0) / 100;
        if (amountFilter === "high_value" && amount < 1000) return false;
        if (amountFilter === "very_high_value" && amount < 5000) return false;
      }

      if (!query) return true;
      const email = (order.customerEmail || "").toLowerCase();
      const id = (order.id || "").toLowerCase();
      return email.includes(query) || id.includes(query);
    });
  }, [
    amountFilter,
    dateFilter,
    debouncedSearchQuery,
    fulfillmentFilter,
    sortedOrders,
  ]);

  const searchSuggestions = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return [];
    return filteredOrders.slice(0, 6);
  }, [filteredOrders, debouncedSearchQuery]);

  useEffect(() => {
    if (!searchFocused || searchSuggestions.length === 0) {
      setHighlightedSuggestion(-1);
      return;
    }
    setHighlightedSuggestion(0);
  }, [searchFocused, searchSuggestions]);

  const handleToggleSelect = useCallback((orderId) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (deselect = false) => {
      if (deselect) {
        setSelectedOrderIds(new Set());
        return;
      }
      setSelectedOrderIds(new Set(filteredOrders.map((order) => order.id)));
    },
    [filteredOrders]
  );

  const handleClearFilters = useCallback(() => {
    setFulfillmentFilter("all");
    setDateFilter("all");
    setAmountFilter("all");
    setSearchQuery("");
  }, []);

  const resetOrdersState = useCallback(() => {
    ordersRequestRef.current += 1;
    setOrders([]);
    setHasMore(false);
    lastOrderCursorRef.current = null;
    setListLoading(false);
    setListError("");
    setSelectedOrderIds(new Set());
    setBulkActionLoading(false);
    setQuickActionId("");
  }, []);

  return {
    orders,
    setOrders,
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
  };
}
