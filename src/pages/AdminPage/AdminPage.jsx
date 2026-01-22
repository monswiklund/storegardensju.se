import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatAmount } from "./adminUtils";
import { AdminService } from "../../services/AdminService";
import {
  STATS_RANGE_OPTIONS,
  getAdminStats,
  listAdminOrders,
  updateAdminOrderFulfillment,
  exportAdminOrders,
} from "../../services/adminService";
import "./AdminPage.css";
import {
  ADMIN_VIEW_OPTIONS,
  DEFAULT_FILTER,
  DEFAULT_STATS_RANGE,
  DEMO_ORDERS,
  DEMO_DETAILS,
  FULFILLMENT_RANK,
  SORT_STORAGE_KEY,
  DATE_FILTER_OPTIONS,
  AMOUNT_FILTER_OPTIONS,
  buildDemoStats,
} from "./adminConstants";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../contexts/ToastContext";
import AdminLogin from "./components/AdminLogin";
import AdminHeader from "./components/AdminHeader";
import AdminStats from "./components/AdminStats";
import AdminOrderList from "./components/AdminOrderList";
import AdminOrderDetail from "./components/AdminOrderDetail";
import AdminCustomers from "./components/AdminCustomers";
import AdminPackingSlip from "./components/AdminPackingSlip";
import AdminCoupons from "./components/AdminCoupons";
import AdminCreateProduct from "./components/AdminCreateProduct";
import AdminProductList from "./components/AdminProductList";

const IS_DEV = import.meta.env.DEV;

function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const lastSyncedOrderRef = useRef("");
  const autoSaveTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const { success, error, info } = useToast();

  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem("adminKey") || ""
  );
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  // States for Order List
  const [orders, setOrders] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [lastOrderCursor, setLastOrderCursor] = useState(null);

  const [selectedId, setSelectedId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [fulfillmentFilter, setFulfillmentFilter] = useState(DEFAULT_FILTER);
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  const [editStatus, setEditStatus] = useState("new");
  const [editNote, setEditNote] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editTrackingCarrier, setEditTrackingCarrier] = useState("auto");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [quickActionId, setQuickActionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [copiedField, setCopiedField] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [statsRange, setStatsRange] = useState(DEFAULT_STATS_RANGE);
  const [sortMode, setSortMode] = useState(() => {
    if (typeof window === "undefined") return "event";
    return localStorage.getItem(SORT_STORAGE_KEY) || "event";
  });
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // Product Management
  const [productViewMode, setProductViewMode] = useState("list"); // list, create, edit
  const [editingProduct, setEditingProduct] = useState(null);

  // Bulk Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const isPreview = previewMode && !adminKey;
  const demoStats = useMemo(() => buildDemoStats(statsRange), [statsRange]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const loadOrders = useCallback(
    async (reset = true) => {
      if (!adminKey && !isPreview) return;
      setListLoading(true);
      setListError("");
      try {
        if (isPreview) {
          setOrders(DEMO_ORDERS);
          setHasMore(false);
        } else {
          const limit = 50;
          const startingAfter = reset ? null : lastOrderCursor;
          const data = await listAdminOrders(
            {
              limit,
              status: "complete", // Fetch all completed orders
              startingAfter,
            },
            adminKey
          );

          const newOrders = data?.data || [];
          if (reset) {
            setOrders(newOrders);
          } else {
            setOrders((prev) => [...prev, ...newOrders]);
          }

          setHasMore(data?.has_more || false);
          if (newOrders.length > 0) {
            setLastOrderCursor(newOrders[newOrders.length - 1].id);
          }
        }
      } catch (error) {
        setListError(error?.message || "Kunde inte hämta ordrar. Försök igen.");
        error("Misslyckades att hämta ordrar");
      } finally {
        setListLoading(false);
      }
    },
    [adminKey, isPreview, lastOrderCursor, error]
  );

  const loadStats = useCallback(async () => {
    if (!adminKey && !isPreview) return;
    setStatsLoading(true);
    setStatsError("");
    try {
      if (isPreview) {
        setStatsData(demoStats);
      } else {
        const data = await getAdminStats(statsRange, adminKey);
        setStatsData(data);
      }
    } catch (err) {
      setStatsError(err?.message || "Kunde inte hämta statistik. Försök igen.");
    } finally {
      setStatsLoading(false);
    }
  }, [adminKey, demoStats, isPreview, statsRange]);

  const loadOrder = useCallback(
    async (orderId) => {
      if ((!adminKey && !isPreview) || !orderId) return;
      setDetailLoading(true);
      setDetailError("");
      try {
        if (isPreview) {
          setSelectedOrder(DEMO_DETAILS[orderId] || null);
        } else {
          const data = await AdminService.getOrder(adminKey, orderId);
          setSelectedOrder(data);
          setEditStatus(data.fulfillment || "new"); // Reset edit state
          setEditNote(data.adminNote || "");
          setEditTracking(data.trackingNumber || "");
          setEditTrackingCarrier(data.trackingCarrier || "auto");
        }
      } catch (err) {
        setDetailError(err?.message || "Kunde inte hämta orderdetaljer.");
        error("Kunde inte hämta orderdetaljer");
      } finally {
        setDetailLoading(false);
      }
    },
    [adminKey, isPreview, error]
  );

  useEffect(() => {
    if (adminKey || isPreview) {
      loadOrders(true);
    }
  }, [adminKey, isPreview]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SORT_STORAGE_KEY, sortMode);
  }, [sortMode]);

  useEffect(() => {
    if (adminKey || isPreview) {
      loadStats();
    }
  }, [adminKey, isPreview, loadStats]);

  useEffect(() => {
    if (selectedId) {
      loadOrder(selectedId);
    }
  }, [selectedId, loadOrder]);

  useEffect(() => {
    if (!selectedOrder) return;
    setEditStatus(selectedOrder.fulfillment || "new");
    setEditNote(selectedOrder.adminNote || "");
    setEditTracking(selectedOrder.trackingNumber || "");
    setEditTrackingCarrier(selectedOrder.trackingCarrier || "auto");
    setSaveError("");
  }, [selectedOrder]);

  const currentStatus = selectedOrder?.fulfillment || "new";
  const currentNote = selectedOrder?.adminNote || "";
  const currentTracking = selectedOrder?.trackingNumber || "";
  const currentTrackingCarrier = selectedOrder?.trackingCarrier || "auto";

  const hasStatusChange =
    selectedOrder && editStatus !== (selectedOrder.fulfillment || "new");
  const hasNoteChange =
    selectedOrder && editNote !== (selectedOrder.adminNote || "");
  const hasTrackingChange =
    selectedOrder && editTracking !== (selectedOrder.trackingNumber || "");
  const hasTrackingCarrierChange =
    selectedOrder &&
    editTrackingCarrier !== (selectedOrder.trackingCarrier || "auto");
  const hasChanges = Boolean(
    selectedOrder &&
      (hasStatusChange ||
        hasNoteChange ||
        hasTrackingChange ||
        hasTrackingCarrierChange)
  );

  const isBackwardStatus =
    selectedOrder &&
    (FULFILLMENT_RANK[editStatus] || 0) <
      (FULFILLMENT_RANK[currentStatus] || 0);

  const runSave = useCallback(
    async ({ status, note, trackingNumber, trackingCarrier, message }) => {
      if (!selectedId) return;
      if (isPreview) {
        info("Demo-läge: ändringar sparas inte.");
        return;
      }

      setSaveLoading(true);
      setSaveError("");
      try {
        await updateAdminOrderFulfillment(
          selectedId,
          { status, note, trackingNumber, trackingCarrier },
          adminKey
        );
        await Promise.all([loadOrders(true), loadOrder(selectedId)]);
        if (message) {
          success(message);
        }
      } catch (err) {
        setSaveError(err?.message || "Kunde inte spara. Försök igen.");
        error("Misslyckades att spara ändringar");
      } finally {
        setSaveLoading(false);
      }
    },
    [
      adminKey,
      isPreview,
      loadOrder,
      selectedId,
      loadOrders,
      success,
      error,
      info,
    ]
  );

  useEffect(() => {
    if (!selectedOrder || isPreview || !adminKey) return;
    if (editStatus === currentStatus) return;
    if (editNote !== currentNote) return;
    if (editTracking !== currentTracking) return;
    if (editTrackingCarrier !== currentTrackingCarrier) return;
    if (saveLoading) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    const nextStatus = editStatus;
    autoSaveTimerRef.current = setTimeout(() => {
      runSave({ status: nextStatus, message: "Status uppdaterad" });
    }, 700);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    adminKey,
    currentNote,
    currentStatus,
    currentTracking,
    currentTrackingCarrier,
    editNote,
    editStatus,
    editTracking,
    editTrackingCarrier,
    isPreview,
    saveLoading,
    selectedOrder,
    runSave,
  ]);

  const orderParam = searchParams.get("order") || "";
  const searchString = searchParams.toString();
  const viewParam = searchParams.get("view") || "overview";
  const hasOrderParam = useMemo(() => {
    if (!orderParam) return false;
    return orders.some((order) => order.id === orderParam);
  }, [orderParam, orders]);

  useEffect(() => {
    if (!orderParam || orderParam === selectedId) return;
    if (orders.length > 0 && !hasOrderParam) return;
    if (orderParam === lastSyncedOrderRef.current) return;
    lastSyncedOrderRef.current = orderParam;
    setSelectedId(orderParam);
  }, [hasOrderParam, orderParam, orders.length, selectedId]);

  useEffect(() => {
    if (orderParam === selectedId) return;

    const nextParams = new URLSearchParams(searchParams);
    if (selectedId) {
      nextParams.set("order", selectedId);
      lastSyncedOrderRef.current = selectedId;
    } else {
      nextParams.delete("order");
      lastSyncedOrderRef.current = "";
    }
    if (nextParams.toString() === searchString) return;
    setSearchParams(nextParams, { replace: true });
  }, [orderParam, searchString, searchParams, selectedId, setSearchParams]);

  const isValidView = ADMIN_VIEW_OPTIONS.some(
    (option) => option.value === viewParam
  );
  const adminView = isValidView ? viewParam : "overview";

  useEffect(() => {
    if (isValidView) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", "overview");
    if (nextParams.toString() === searchString) return;
    setSearchParams(nextParams, { replace: true });
  }, [isValidView, searchParams, searchString, setSearchParams]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const handleChange = (event) => {
      setIsMobile(event.matches);
      if (event.matches) {
        setViewMode(selectedId ? "detail" : "list");
      } else {
        setViewMode("detail");
      }
    };

    setIsMobile(mediaQuery.matches);
    if (mediaQuery.matches) {
      setViewMode(selectedId ? "detail" : "list");
    } else {
      setViewMode("detail");
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [selectedId]);

  const showStatsSection = adminView === "overview" || adminView === "stats";
  const showOrdersSection = adminView === "overview" || adminView === "orders";
  const showCustomersSection = adminView === "customers";
  const showProductsSection = adminView === "products";

  const showCouponsSection = adminView === "coupons";

  const handleAdminViewChange = (view) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", view);
    setSearchParams(nextParams, { replace: true });
  };

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

  const statsSummary = useMemo(() => {
    const data = statsData || (isPreview ? demoStats : null);
    if (!data) {
      return {
        totalOrders: 0,
        paidTotal: 0,
        averageOrder: 0,
        itemsTotal: 0,
        totalItems: 0,
        categories: [],
      };
    }
    return {
      totalOrders: data.totalOrders || 0,
      paidTotal: data.paidTotal || 0,
      averageOrder: data.averageOrder || 0,
      itemsTotal: data.itemsTotal || 0,
      totalItems: data.totalItems || 0,
      categories: data.categories || [],
    };
  }, [demoStats, isPreview, statsData]);

  const filteredOrders = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();

    return sortedOrders.filter((order) => {
      // 1. Fulfillment Filter
      const matchesFulfillment =
        fulfillmentFilter === "all" ||
        (order.fulfillment || "new") === fulfillmentFilter;
      if (!matchesFulfillment) return false;

      // 2. Date Filter
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

      // 3. Amount Filter
      if (amountFilter !== "all") {
        const amount = (order.amountTotal || 0) / 100;
        if (amountFilter === "high_value" && amount < 1000) return false;
        if (amountFilter === "very_high_value" && amount < 5000) return false;
      }

      // 4. Search Query
      if (!query) return true;
      const email = (order.customerEmail || "").toLowerCase();
      const id = (order.id || "").toLowerCase();
      return email.includes(query) || id.includes(query);
    });
  }, [
    sortedOrders,
    fulfillmentFilter,
    dateFilter,
    amountFilter,
    debouncedSearchQuery,
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

  useEffect(() => {
    if (filteredOrders.length === 0 && !searchQuery) {
      // Logic for selecting first order only if not searching (searching might filter all out)
    }

    if (filteredOrders.length > 0 && !selectedId && !isMobile) {
      setSelectedId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedId, isMobile, searchQuery]);

  const handleLogin = (event) => {
    event.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setKeyError("Skriv in admin-nyckeln.");
      return;
    }
    sessionStorage.setItem("adminKey", trimmed);
    setAdminKey(trimmed);
    setPreviewMode(false);
    setKeyInput("");
    setKeyError("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminKey");
    setAdminKey("");
    setPreviewMode(false);
    setOrders([]);
    setSelectedId("");
    setSelectedOrder(null);
    setStatsData(null);
    setStatsError("");
    setStatsLoading(false);
  };

  const handleRefresh = async () => {
    info("Uppdaterar...");
    await loadOrders(true);
    if (selectedId) {
      await loadOrder(selectedId);
    }
    success("Uppdaterad");
  };

  const handleExport = async () => {
    if (isPreview) {
      info("Demo-läge: export är avstängd.");
      return;
    }
    if (!adminKey) return;
    try {
      const blob = await exportAdminOrders(
        {
          limit: 500,
          status: "complete",
          fulfillment: fulfillmentFilter !== "all" ? fulfillmentFilter : "",
        },
        adminKey
      );
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
      error("Export misslyckades");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedId || !hasChanges) return;
    await runSave({
      status: editStatus,
      note: editNote,
      trackingNumber: editTracking,
      trackingCarrier: editTrackingCarrier,
      message: "Sparat!",
    });
  };

  const handleQuickStatus = async (event, orderId, status) => {
    event.stopPropagation();
    if (isPreview) {
      info("Demo-läge: ändringar sparas inte.");
      return;
    }
    if (!adminKey) return;

    setQuickActionId(orderId);
    setListError("");
    try {
      await updateAdminOrderFulfillment(orderId, { status }, adminKey);
      await loadOrders(true);
      if (selectedId === orderId) {
        await loadOrder(orderId);
      }
      success("Order uppdaterad");
    } catch (err) {
      setListError(
        err?.message || "Kunde inte uppdatera statusen. Försök igen."
      );
      error("Misslyckades att uppdatera order");
    } finally {
      setQuickActionId("");
    }
  };

  const handleRefund = async () => {
    if (!selectedId) return;
    if (isPreview) {
      info("Demo-läge: återbetalningar kan inte göras.");
      return;
    }

    // Simple prompt for now
    const amountStr = window.prompt(
      "Ange belopp att återbetala i SEK (t.ex. 100): \nLämna tomt för att avbryta."
    );
    if (!amountStr) return;

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      error("Ogiltigt belopp");
      return;
    }

    // Confirm
    if (!window.confirm(`Är du säker på att du vill återbetala ${amount} kr?`))
      return;

    try {
      // Amount in öre
      const payload = { amount: amount * 100 };
      await AdminService.refundOrder(adminKey, selectedId, payload);

      success(`Återbetalat ${amount} kr`);
      // Reload order
      await loadOrder(selectedId);
    } catch (err) {
      error(err.message || "Kunde inte genomföra återbetalning");
    }
  };

  const handleToggleSelect = (orderId) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleSelectAll = (deselect = false) => {
    if (deselect) {
      setSelectedOrderIds(new Set());
    } else {
      // Select only visible filtered orders
      const allIds = filteredOrders.map((o) => o.id);
      setSelectedOrderIds(new Set(allIds));
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedOrderIds.size === 0) return;
    if (isPreview) {
      info(`Bulk update: ${selectedOrderIds.size} orders`);
      return;
    }

    const confirmMsg = `Är du säker på att du vill ändra status till "${status}" för ${selectedOrderIds.size} ordrar?`;
    if (!window.confirm(confirmMsg)) return;

    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedOrderIds).map((id) =>
        updateAdminOrderFulfillment(id, { status }, adminKey)
      );
      await Promise.all(promises);

      await loadOrders(true);
      setSelectedOrderIds(new Set());
      success("Massuppdatering klar");
    } catch (err) {
      error("Fel vid massuppdatering");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectOrder = (orderId) => {
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
  };

  const handleSuggestionClick = (orderId) => {
    setSearchQuery(orderId);
    setSearchFocused(false);
    handleSelectOrder(orderId);
  };

  const handleSearchKeyDown = (event) => {
    if (!searchFocused || searchSuggestions.length === 0) return;

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
  };

  const handleCopyText = async (text, field) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedField(field);
      success("Kopierat!");
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      setCopiedField("");
    }
  };

  const handleReset = () => {
    if (!selectedOrder) return;
    setEditStatus(currentStatus);
    setEditNote(currentNote);
    setEditTracking(currentTracking);
    setEditTrackingCarrier(currentTrackingCarrier);
    setSaveError("");
  };

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

  if (!adminKey && !previewMode) {
    return (
      <AdminLogin
        keyInput={keyInput}
        setKeyInput={setKeyInput}
        onLogin={handleLogin}
        error={keyError || listError}
        onPreview={() => setPreviewMode(true)}
      />
    );
  }

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="admin-container">
          <AdminHeader
            isPreview={isPreview}
            listLoading={listLoading}
            onRefresh={handleRefresh}
            onLogout={handleLogout}
            adminView={adminView}
            onViewChange={handleAdminViewChange}
          />

          <AdminPackingSlip order={selectedOrder} />

          {showStatsSection && (
            <AdminStats
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

          {showCustomersSection && (
            <AdminCustomers orders={orders} loading={listLoading} />
          )}

          {showProductsSection && (
            <>
              {productViewMode === "list" && (
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                  <div
                    style={{
                      marginBottom: "1rem",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductViewMode("create");
                      }}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      + Skapa ny produkt
                    </button>
                  </div>
                  <AdminProductList
                    adminKey={adminKey}
                    onEdit={(product) => {
                      setEditingProduct(product);
                      setProductViewMode("edit");
                    }}
                  />
                </div>
              )}

              {(productViewMode === "create" || productViewMode === "edit") && (
                <AdminCreateProduct
                  adminKey={adminKey}
                  initialData={
                    productViewMode === "edit" ? editingProduct : null
                  }
                  onCancel={() => {
                    setEditingProduct(null);
                    setProductViewMode("list");
                  }}
                  onSuccess={() => {
                    setEditingProduct(null);
                    setProductViewMode("list");
                  }}
                />
              )}
            </>
          )}

          {showCouponsSection && <AdminCoupons adminKey={adminKey} />}

          {showOrdersSection && isMobile && (
            <div className="admin-mobile-tabs">
              <button
                type="button"
                className={`admin-tab-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                Ordrar
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${
                  viewMode === "detail" ? "active" : ""
                }`}
                onClick={() => setViewMode("detail")}
                disabled={!selectedId}
              >
                Detaljer
              </button>
            </div>
          )}

          {showOrdersSection && (
            <div className="admin-panels">
              <AdminOrderList
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
                isMobile={isMobile}
                viewMode={viewMode}
                ordersCount={orders.length}
                // Pagination
                hasMore={hasMore}
                onLoadMore={() => loadOrders(false)}
                // Bulk Actions
                selectedOrderIds={selectedOrderIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onBulkAction={handleBulkAction}
                bulkActionLoading={bulkActionLoading}
              />

              <AdminOrderDetail
                order={selectedOrder}
                loading={detailLoading}
                error={detailError}
                customerHistory={customerHistory}
                onCopy={handleCopyText}
                copiedField={copiedField}
                editState={{
                  status: editStatus,
                  note: editNote,
                  tracking: editTracking,
                  trackingCarrier: editTrackingCarrier,
                  setStatus: setEditStatus,
                  setNote: setEditNote,
                  setTracking: setEditTracking,
                  setTrackingCarrier: setEditTrackingCarrier,
                }}
                onSave={handleSave}
                onReset={handleReset}
                onRefund={handleRefund}
                hasChanges={hasChanges}
                isBackwardStatus={isBackwardStatus}
                saveStatus={{
                  loading: saveLoading,
                  error: saveError,
                }}
                isMobile={isMobile}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>
          )}
        </div>
      </PageSection>
    </main>
  );
}

export default AdminPage;
