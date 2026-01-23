import React, { useMemo } from "react";
import LoadingSpinner from "../../../components/ui/LoadingSpinner.jsx";
import Skeleton from "../../../components/ui/Skeleton.jsx";

// Sub-components
import OrderHeader from "./OrderDetail/OrderHeader";
import OrderStatusCard from "./OrderDetail/OrderStatusCard";
import OrderLineItems from "./OrderDetail/OrderLineItems";
import OrderEvents from "./OrderDetail/OrderEvents";
import CustomerCard from "./OrderDetail/CustomerCard";
import OrderForm from "./OrderDetail/OrderForm";
import OrderMeta from "./OrderDetail/OrderMeta";

function AdminOrderDetail({
  order,
  loading,
  error,
  customerHistory,
  onCopy,
  copiedField,
  editState,
  setEditState,
  onSave,
  onReset,
  hasChanges,
  isBackwardStatus,
  saveStatus,
  isMobile,
  viewMode,
  setViewMode,
  onRefund,
  onCustomerFilter,
}) {
  const isHidden = isMobile && viewMode !== "detail";

  const orderEvents = useMemo(() => {
    if (!order?.events?.length) return [];
    return [...order.events].sort((a, b) => a.timestamp - b.timestamp);
  }, [order]);

  const latestEvent = orderEvents.length
    ? orderEvents[orderEvents.length - 1]
    : null;

  return (
    <section
      className={`admin-panel admin-panel-detail ${
        isHidden ? "is-hidden" : ""
      }`}
      id="admin-details"
    >
      <div className="admin-panel-header">
        <h3>Orderdetaljer</h3>
        {saveStatus.loading && (
          <span className="admin-save-indicator">
            <LoadingSpinner size="small" text="" /> Sparar...
          </span>
        )}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading && !order && (
        <div className="admin-detail">
          <div className="admin-detail-header">
            <div>
              <Skeleton
                width="100px"
                height="12px"
                style={{ marginBottom: 6 }}
              />
              <Skeleton width="180px" height="18px" />
            </div>
          </div>
          <div className="admin-customer-card">
            <div className="admin-customer-grid">
              <Skeleton width="100%" height="40px" />
              <Skeleton width="100%" height="40px" />
              <Skeleton width="100%" height="40px" />
            </div>
          </div>
          <div className="admin-detail-list">
            <div style={{ padding: "1.5rem" }}>
              <Skeleton
                width="100%"
                height="20px"
                style={{ marginBottom: 12 }}
              />
              <Skeleton
                width="80%"
                height="20px"
                style={{ marginBottom: 12 }}
              />
              <Skeleton width="60%" height="20px" />
            </div>
          </div>
        </div>
      )}

      {!loading && !order && (
        <div className="admin-empty">
          <p>Välj en order för att se detaljer.</p>
        </div>
      )}

      {order && (
        <div className="admin-detail admin-detail-vertical">
          <OrderHeader
            order={order}
            isMobile={isMobile}
            setViewMode={setViewMode}
          />

          <div className="admin-detail-stack">
            <CustomerCard
              order={order}
              customerHistory={customerHistory}
              onCopy={onCopy}
              copiedField={copiedField}
              onCustomerFilter={onCustomerFilter}
            />

            <OrderStatusCard
              order={order}
              latestEvent={latestEvent}
              onCopy={onCopy}
              copiedField={copiedField}
            />

            <OrderLineItems
              order={order}
              onCopy={onCopy}
              copiedField={copiedField}
            />

            <OrderEvents order={order} />

            <OrderForm
              order={order}
              editState={editState}
              saveStatus={saveStatus}
              hasChanges={hasChanges}
              isBackwardStatus={isBackwardStatus}
              onSave={onSave}
              onReset={onReset}
            />

            <OrderMeta order={order} onCopy={onCopy} copiedField={copiedField} />

            <div className="admin-refund-card">
              <h3>Hantera betalning</h3>
              <button
                type="button"
                className="admin-btn-secondary admin-btn-block admin-refund-btn"
                onClick={onRefund}
              >
                Återbetala...
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminOrderDetail;
