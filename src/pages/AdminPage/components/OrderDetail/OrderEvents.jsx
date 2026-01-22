import React, { useMemo } from "react";
import { formatDateTime, formatEventLabel } from "../../adminUtils";

function OrderEvents({ order }) {
  const orderEvents = useMemo(() => {
    if (!order?.events?.length) return [];
    return [...order.events].sort((a, b) => a.timestamp - b.timestamp);
  }, [order]);

  return (
    <div className="admin-card" id="admin-events">
      <div className="admin-card-header">
        <h3>Händelser</h3>
      </div>
      {orderEvents.length === 0 ? (
        <div className="admin-empty admin-empty-compact">
          <p>Ingen händelsehistorik ännu.</p>
        </div>
      ) : (
        <div className="admin-events-list">
          {orderEvents.map((event, index) => (
            <div
              key={`${event.type}-${event.timestamp}-${index}`}
              className="admin-event"
            >
              <div className="admin-event-dot" />
              <div className="admin-event-body">
                <div className="admin-event-row">
                  <p className="admin-event-title">{formatEventLabel(event)}</p>
                  <span className="admin-event-time">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderEvents;
