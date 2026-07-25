import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "../../../config/apiBaseUrl";
import { ADMIN_VIEW_OPTIONS } from "../adminConstants";
import { isLoopbackHost } from "../adminAuthConstants";

const SIDEBAR_PREFERENCE_KEY = "storegarden-admin-sidebar-collapsed";

const readSidebarPreference = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
  return null;
};

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
  const [sidebarPreference, setSidebarPreference] = useState(readSidebarPreference);
  const [isMediumSidebar, setIsMediumSidebar] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  const isPreview = previewMode && !adminKey;
  const isSidebarCollapsed = sidebarPreference ?? isMediumSidebar;

  const handleToggleSidebarCollapsed = useCallback(() => {
    setSidebarPreference((currentPreference) => {
      const currentValue = currentPreference ?? isMediumSidebar;
      const nextValue = !currentValue;
      try {
        window.localStorage.setItem(
          SIDEBAR_PREFERENCE_KEY,
          String(nextValue)
        );
      } catch {
        // The preference remains active for this session when storage is unavailable.
      }
      return nextValue;
    });
  }, [isMediumSidebar]);

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

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(
      "(min-width: 1100px) and (max-width: 1499px)"
    );
    const handleChange = (event) => setIsMediumSidebar(event.matches);

    setIsMediumSidebar(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleOpenAccessLogin = useCallback(() => {
    if (typeof window === "undefined") return;
    const apiBaseUrl = getApiBaseUrl();
    const isAllowedApiBase =
      apiBaseUrl === "/__api" || apiBaseUrl.startsWith("https://");
    if (!isAllowedApiBase) {
      console.error("[admin] refusing access-login redirect — unsafe API base", apiBaseUrl);
      return;
    }
    const returnUrl = `${window.location.origin}/admin`;
    try {
      const parsedReturn = new URL(returnUrl);
      if (parsedReturn.origin !== window.location.origin) {
        console.error("[admin] refusing access-login — origin mismatch", parsedReturn.origin);
        return;
      }
    } catch {
      return;
    }
    const returnTo = encodeURIComponent(returnUrl);
    const loginUrl = `${apiBaseUrl}/admin/access-login?redirect=${returnTo}`;
    if (isLoopbackHost(window.location.hostname)) {
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
    isSidebarCollapsed,
    handleToggleSidebarCollapsed,
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
