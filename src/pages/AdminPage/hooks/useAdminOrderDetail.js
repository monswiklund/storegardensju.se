import { useCallback, useEffect, useRef, useState } from "react";
import { AdminService } from "../../../services/adminService";
import { FULFILLMENT_LABELS, FULFILLMENT_RANK } from "../adminConstants";

export function useAdminOrderDetail({
  adminKey,
  isPreview,
  selectedId,
  demoDetails,
  loadOrders,
  handleApiError,
  success,
  error,
  info,
}) {
  const detailRequestRef = useRef(0);
  const autoSaveTimerRef = useRef(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [editStatus, setEditStatus] = useState("new");
  const [editNote, setEditNote] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editTrackingCarrier, setEditTrackingCarrier] = useState("auto");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const loadOrder = useCallback(
    async (orderId) => {
      if ((!adminKey && !isPreview) || !orderId) return;
      const requestId = ++detailRequestRef.current;
      setDetailLoading(true);
      setDetailError("");
      try {
        if (isPreview) {
          if (requestId !== detailRequestRef.current) return;
          setSelectedOrder(demoDetails[orderId] || null);
        } else {
          const data = await AdminService.getOrder(adminKey, orderId);
          if (requestId !== detailRequestRef.current) return;
          setSelectedOrder(data);
          setEditStatus(data.fulfillment || "new");
          setEditNote(data.adminNote || "");
          setEditTracking(data.trackingNumber || "");
          setEditTrackingCarrier(data.trackingCarrier || "auto");
        }
      } catch (err) {
        if (requestId !== detailRequestRef.current) return;
        setDetailError(err?.message || "Kunde inte hämta orderdetaljer.");
        handleApiError(err, "Orderdetaljer");
      } finally {
        if (requestId === detailRequestRef.current) {
          setDetailLoading(false);
        }
      }
    },
    [adminKey, demoDetails, handleApiError, isPreview]
  );

  useEffect(() => {
    if (selectedId) {
      loadOrder(selectedId);
      return;
    }
    detailRequestRef.current += 1;
    setSelectedOrder(null);
    setDetailLoading(false);
    setDetailError("");
  }, [loadOrder, selectedId]);

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
        await AdminService.updateFulfillment(adminKey, selectedId, {
          status,
          note,
          trackingNumber,
          trackingCarrier,
        });
        await Promise.all([loadOrders(true), loadOrder(selectedId)]);
        if (message) {
          success(message);
        }
      } catch (err) {
        setSaveError(err?.message || "Kunde inte spara. Försök igen.");
        handleApiError(err, "Spara-fel");
      } finally {
        setSaveLoading(false);
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
      success,
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
    runSave,
    saveLoading,
    selectedOrder,
  ]);

  const handleSave = useCallback(
    async (event) => {
      event.preventDefault();
      if (!selectedId || !hasChanges) return;
      const changes = [];
      if (hasStatusChange) {
        const currentLabel = FULFILLMENT_LABELS[currentStatus] || currentStatus;
        const nextLabel = FULFILLMENT_LABELS[editStatus] || editStatus;
        changes.push(`status: ${currentLabel} -> ${nextLabel}`);
      }
      if (hasTrackingChange) {
        changes.push(editTracking ? "spårning uppdaterad" : "spårning borttagen");
      }
      if (hasTrackingCarrierChange) {
        changes.push("transportör uppdaterad");
      }
      if (hasNoteChange) {
        changes.push("notering uppdaterad");
      }
      await runSave({
        status: editStatus,
        note: editNote,
        trackingNumber: editTracking,
        trackingCarrier: editTrackingCarrier,
        message: `Order uppdaterad${changes.length ? ` (${changes.join(", ")})` : ""}`,
      });
    },
    [
      currentStatus,
      editNote,
      editStatus,
      editTracking,
      editTrackingCarrier,
      hasChanges,
      hasNoteChange,
      hasStatusChange,
      hasTrackingCarrierChange,
      hasTrackingChange,
      runSave,
      selectedId,
    ]
  );

  const handleRefund = useCallback(async () => {
    if (!selectedId) return;
    if (isPreview) {
      info("Demo-läge: återbetalningar kan inte göras.");
      return;
    }

    const amountStr = window.prompt(
      "Ange belopp att återbetala i SEK (t.ex. 100): \nLämna tomt för att avbryta."
    );
    if (!amountStr) return;

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      error("Ogiltigt belopp");
      return;
    }

    if (!window.confirm(`Är du säker på att du vill återbetala ${amount} kr?`)) {
      return;
    }

    try {
      await AdminService.refundOrder(adminKey, selectedId, amount * 100);
      success(`Återbetalat ${amount} kr`);
      await Promise.all([loadOrders(true), loadOrder(selectedId)]);
    } catch (err) {
      handleApiError(err, "Återbetalning misslyckades");
    }
  }, [
    adminKey,
    error,
    handleApiError,
    info,
    isPreview,
    loadOrder,
    loadOrders,
    selectedId,
    success,
  ]);

  const handleReset = useCallback(() => {
    if (!selectedOrder) return;
    setEditStatus(currentStatus);
    setEditNote(currentNote);
    setEditTracking(currentTracking);
    setEditTrackingCarrier(currentTrackingCarrier);
    setSaveError("");
  }, [currentNote, currentStatus, currentTracking, currentTrackingCarrier, selectedOrder]);

  const resetDetailState = useCallback(() => {
    detailRequestRef.current += 1;
    setSelectedOrder(null);
    setDetailLoading(false);
    setDetailError("");
    setEditStatus("new");
    setEditNote("");
    setEditTracking("");
    setEditTrackingCarrier("auto");
    setSaveLoading(false);
    setSaveError("");
  }, []);

  return {
    selectedOrder,
    detailLoading,
    detailError,
    editState: {
      status: editStatus,
      note: editNote,
      tracking: editTracking,
      trackingCarrier: editTrackingCarrier,
      setStatus: setEditStatus,
      setNote: setEditNote,
      setTracking: setEditTracking,
      setTrackingCarrier: setEditTrackingCarrier,
    },
    saveStatus: {
      loading: saveLoading,
      error: saveError,
    },
    hasChanges,
    isBackwardStatus,
    loadOrder,
    handleSave,
    handleRefund,
    handleReset,
    resetDetailState,
  };
}
