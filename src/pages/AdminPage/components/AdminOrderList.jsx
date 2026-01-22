import {
  FULFILLMENT_FILTERS,
  ORDER_SORT_OPTIONS,
  FULFILLMENT_LABELS,
  PAYMENT_LABELS,
  FULFILLMENT_OPTIONS,
  DATE_FILTER_OPTIONS,
  AMOUNT_FILTER_OPTIONS,
} from "../adminConstants";
import LoadingSpinner from "../../../components/ui/LoadingSpinner.jsx";
import Skeleton from "../../../components/ui/Skeleton.jsx";
import {
  formatAmount,
  formatDateTime,
  formatListEventLabel,
} from "../adminUtils";

function AdminOrderList({
  filteredOrders,
  selectedId,
  onSelectOrder,
  onExport,
  sortMode,
  setSortMode,
  listLoading,
  listError,
  fulfillmentFilter,
  setFulfillmentFilter,
  dateFilter,
  setDateFilter,
  amountFilter,
  setAmountFilter,
  counts,
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  handleSearchKeyDown,
  searchSuggestions,
  onSuggestionClick,
  highlightedSuggestion,
  handleQuickStatus,
  quickActionId,
  isMobile,
  viewMode,
  ordersCount,
  hasMore,
  onLoadMore,
  selectedOrderIds,
  onToggleSelect,
  onSelectAll,
  onBulkAction,
  bulkActionLoading,
}) {
  const isHidden = isMobile && viewMode !== "list";
  const allSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedOrderIds.has(o.id));
  const someSelected = selectedOrderIds.size > 0;

  return (
    <section
      className={`admin-panel admin-panel-list ${isHidden ? "is-hidden" : ""}`}
      id="admin-orders"
    >
      <div className="admin-panel-header">
        <div className="admin-header-title">
          <h2>Ordrar</h2>
          <span className="admin-count-badge">{ordersCount} st</span>
        </div>
        <div className="admin-panel-actions">
          {/* Export moved here or kept here? Kept here for global actions */}
          <button
            type="button"
            className="admin-btn-secondary admin-btn-sm"
            onClick={onExport}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="admin-controls">
        <div className="admin-search-wrapper">
          <input
            type="search"
            className="admin-input admin-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => {
              window.setTimeout(() => setSearchFocused(false), 150);
            }}
            placeholder="Sök order..."
            role="combobox"
            aria-expanded={searchFocused && searchSuggestions.length > 0}
            aria-controls="admin-search-suggestions"
            aria-activedescendant={
              highlightedSuggestion >= 0
                ? `admin-suggestion-${highlightedSuggestion}`
                : undefined
            }
          />
          {searchFocused && searchSuggestions.length > 0 && (
            <div
              id="admin-search-suggestions"
              className="admin-search-suggestions"
              role="listbox"
            >
              {searchSuggestions.map((order, index) => (
                <button
                  type="button"
                  key={order.id}
                  id={`admin-suggestion-${index}`}
                  className={`admin-suggestion ${
                    highlightedSuggestion === index ? "active" : ""
                  }`}
                  onClick={() => onSuggestionClick(order.id)}
                  role="option"
                  aria-selected={highlightedSuggestion === index}
                >
                  <div>
                    <p className="admin-suggestion-title">
                      {order.customerEmail || "Okänd email"}
                    </p>
                    <p className="admin-suggestion-subtitle">{order.id}</p>
                  </div>
                  <div className="admin-suggestion-meta">
                    <span>{formatAmount(order.amountTotal)}</span>
                    <span>{formatDateTime(order.created)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="admin-filters-group">
          <select
            className="admin-select admin-select-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filtrera på datum"
          >
            {DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="admin-select admin-select-sm"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            aria-label="Filtrera på belopp"
          >
            {AMOUNT_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            id="order-sort"
            className="admin-select admin-select-sm"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            aria-label="Sortera"
          >
            {ORDER_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-tabs-row">
        <div className="admin-tabs">
          {FULFILLMENT_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`admin-tab-link ${
                fulfillmentFilter === filter.value ? "active" : ""
              }`}
              onClick={() => setFulfillmentFilter(filter.value)}
            >
              {filter.label}
              <span className="admin-tab-count">
                {counts[filter.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length > 0 && (
        <div className="admin-list-actions">
          <label className="admin-checkbox-label">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => onSelectAll(allSelected)}
            />
            <span>Markera alla</span>
          </label>
        </div>
      )}

      {someSelected && (
        <div className="admin-bulk-actions fade-in">
          <div className="admin-bulk-info">
            <span>{selectedOrderIds.size} valda</span>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => onSelectAll(true)}
            >
              Avbryt
            </button>
          </div>
          <div className="admin-bulk-controls">
            {bulkActionLoading ? (
              <span className="admin-muted">Uppdaterar...</span>
            ) : (
              <>
                <button
                  type="button"
                  className="admin-btn-secondary admin-btn-sm"
                  onClick={() => onBulkAction("ship")}
                >
                  Markera "Att skicka"
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary admin-btn-sm"
                  onClick={() => onBulkAction("completed")}
                >
                  Markera "Klar"
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {listError && <p className="admin-error">{listError}</p>}

      {listLoading && ordersCount === 0 && (
        <div className="admin-order-list">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="admin-order-card skeleton-card"
              style={{ pointerEvents: "none" }}
            >
              <div className="admin-order-row-content">
                <Skeleton
                  width="40px"
                  height="40px"
                  style={{ borderRadius: "4px" }}
                />
                <div style={{ flex: 1, display: "grid", gap: "0.5rem" }}>
                  <Skeleton width="30%" height="1rem" />
                  <Skeleton width="50%" height="0.8rem" />
                </div>
                <Skeleton
                  width="80px"
                  height="1.5rem"
                  style={{ borderRadius: "99px" }}
                />
                <Skeleton width="80px" height="1.5rem" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!listLoading && filteredOrders.length === 0 && (
        <div className="admin-empty">
          <p>Inga ordrar i denna vy.</p>
        </div>
      )}

      <div className="admin-order-list">
        {filteredOrders.map((order) => {
          const fulfillmentValue = order.fulfillment || "new";
          const fulfillmentLabel =
            FULFILLMENT_LABELS[fulfillmentValue] || fulfillmentValue;
          const paymentLabel =
            PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus;
          const isSelected = order.id === selectedId;
          const isChecked = selectedOrderIds.has(order.id);
          const isQuickLoading = quickActionId === order.id;
          const currentStatus = fulfillmentValue;
          const lastEventType = order.lastEventType || "";
          const lastEventAt = order.lastEventAt || 0;
          const lastEventValue = order.lastEventValue || "";
          const showLastEvent =
            lastEventType &&
            lastEventAt &&
            (lastEventType !== "created" || lastEventAt !== order.created);
          const listEventLabel = showLastEvent
            ? formatListEventLabel({
                type: lastEventType,
                value: lastEventValue,
              })
            : "";

          return (
            <div
              key={order.id}
              className={`admin-order-card ${isSelected ? "selected" : ""} ${
                isChecked ? "checked" : ""
              }`}
              onClick={() => onSelectOrder(order.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectOrder(order.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
            >
              <div className="admin-order-top-row">
                <div
                  className="admin-order-checkbox"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(order.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by div click
                    tabIndex={-1}
                  />
                </div>

                <div className="admin-order-content">
                  <div className="admin-order-main">
                    <div className="admin-order-header">
                      <span className="admin-order-id">{order.id}</span>
                      <span className="admin-order-date">
                        {formatDateTime(order.created)}
                      </span>
                    </div>
                    <div className="admin-order-customer">
                      <span className="admin-order-email">
                        {order.customerEmail || "Okänd email"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-order-end">
                    <span className="admin-order-amount">
                      {formatAmount(order.amountTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-order-footer">
                <span className={`admin-chip admin-chip-${fulfillmentValue}`}>
                  {fulfillmentLabel}
                </span>
                <span
                  className={`admin-chip ${
                    order.paymentStatus === "paid"
                      ? "admin-chip-paid"
                      : "admin-chip-payment"
                  }`}
                >
                  {paymentLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="admin-load-more">
          <button
            type="button"
            className="admin-btn-secondary admin-btn-block"
            onClick={onLoadMore}
            disabled={listLoading}
          >
            {listLoading ? "Laddar..." : "Ladda fler ordrar"}
          </button>
        </div>
      )}
    </section>
  );
}

export default AdminOrderList;
