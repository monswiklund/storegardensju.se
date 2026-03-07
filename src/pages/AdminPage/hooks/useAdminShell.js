import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "../../../config/apiBaseUrl";
import { ADMIN_VIEW_OPTIONS } from "../adminConstants";

export function useAdminShell({
  initialAdminKey,
  searchParams,
  setSearchParams,
}) {
  const lastSyncedOrderRef = useRef("");

  const [adminKey, setAdminKey] = useState(initialAdminKey);
  const [requiresAccessLogin, setRequiresAccessLogin] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  const isPreview = previewMode && !adminKey;

  const resetShellState = useCallback(() => {
    setAdminKey("");
    setRequiresAccessLogin(false);
    setPreviewMode(false);
    setSelectedId("");
  }, []);

  useEffect(() => {
    const handleGlobalEsc = (e) => {
      if (e.key === "Escape") {
        if (
          document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA"
        ) {
          document.activeElement.blur();
          return;
        }
        if (selectedId) {
          setSelectedId("");
          if (isMobile) {
            setViewMode("list");
          }
        }
      }
    };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, [isMobile, selectedId]);

  const orderParam = searchParams.get("order") || "";
  const searchString = searchParams.toString();
  const viewParam = searchParams.get("view") || "overview";

  useEffect(() => {
    if (!orderParam || orderParam === selectedId) return;
    if (orderParam === lastSyncedOrderRef.current) return;
    lastSyncedOrderRef.current = orderParam;
    setSelectedId(orderParam);
  }, [orderParam, selectedId]);

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
  }, [orderParam, searchParams, searchString, selectedId, setSearchParams]);

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

  const handleOpenAccessLogin = useCallback(() => {
    if (typeof window === "undefined") return;
    const apiBaseUrl = getApiBaseUrl();
    const returnTo = encodeURIComponent(`${window.location.origin}/admin`);
    const loginUrl = `${apiBaseUrl}/admin/access-login?redirect=${returnTo}`;
    const host = window.location.hostname;
    const isLocalHost = host === "localhost" || host === "127.0.0.1";
    if (isLocalHost) {
      window.open(loginUrl, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.assign(loginUrl);
  }, []);

  const handleSwitchAccount = useCallback(() => {
    resetShellState();
    handleOpenAccessLogin();
  }, [handleOpenAccessLogin, resetShellState]);

  const handleAdminViewChange = useCallback(
    (view) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("view", view);
      setSearchParams(nextParams, { replace: true });
      setIsSidebarOpen(false);
    },
    [searchParams, setSearchParams]
  );

  return {
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
  };
}
