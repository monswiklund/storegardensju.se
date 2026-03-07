import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminService } from "../../../services/adminService";

export function useAdminStats({
  adminKey,
  isPreview,
  demoStats,
  statsRange,
  handleApiError,
}) {
  const statsRequestRef = useRef(0);
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  const loadStats = useCallback(async () => {
    if (!adminKey && !isPreview) return;
    const requestId = ++statsRequestRef.current;
    setStatsLoading(true);
    setStatsError("");
    try {
      if (isPreview) {
        if (requestId !== statsRequestRef.current) return;
        setStatsData(demoStats);
      } else {
        const data = await AdminService.getStats(adminKey, statsRange);
        if (requestId !== statsRequestRef.current) return;
        setStatsData(data);
      }
    } catch (err) {
      if (requestId !== statsRequestRef.current) return;
      setStatsError(err?.message || "Kunde inte hämta statistik. Försök igen.");
      handleApiError(err, "Statistikfel");
    } finally {
      if (requestId === statsRequestRef.current) {
        setStatsLoading(false);
      }
    }
  }, [adminKey, demoStats, handleApiError, isPreview, statsRange]);

  useEffect(() => {
    if (adminKey || isPreview) {
      loadStats();
    }
  }, [adminKey, isPreview, loadStats]);

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
        series: [],
        generatedAt: 0,
        cached: false,
      };
    }
    return {
      totalOrders: data.totalOrders || 0,
      paidTotal: data.paidTotal || 0,
      averageOrder: data.averageOrder || 0,
      itemsTotal: data.itemsTotal || 0,
      totalItems: data.totalItems || 0,
      categories: data.categories || [],
      series: data.series || [],
      generatedAt: data.generatedAt || 0,
      cached: Boolean(data.cached),
    };
  }, [demoStats, isPreview, statsData]);

  const resetStatsState = useCallback(() => {
    statsRequestRef.current += 1;
    setStatsData(null);
    setStatsError("");
    setStatsLoading(false);
  }, []);

  return {
    statsExpanded,
    setStatsExpanded,
    categoryExpanded,
    setCategoryExpanded,
    statsLoading,
    statsError,
    statsSummary,
    loadStats,
    resetStatsState,
  };
}
