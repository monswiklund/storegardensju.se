import { STATS_RANGE_OPTIONS } from "../adminConstants";
import LoadingSpinner from "../../../components/ui/LoadingSpinner.jsx";
import { formatPrice } from "../../../services/stripeService";

function AdminStats({
  statsRange,
  setStatsRange,
  statsExpanded,
  setStatsExpanded,
  statsLoading,
  statsError,
  statsSummary,
  categoryExpanded,
  setCategoryExpanded,
}) {
  const statsRangeLabel =
    STATS_RANGE_OPTIONS.find((o) => o.value === statsRange)?.label || "Alla";

  const topCategory = statsSummary.categories[0];

  const formatAmount = (amountMinor) => formatPrice((amountMinor || 0) / 100);

  return (
    <>
      <div className="admin-stats-header" id="admin-stats">
        <div className="admin-stats-title">
          <h2>Statistik</h2>
          <p className="admin-muted">Period: {statsRangeLabel.toLowerCase()}</p>
        </div>
        <div className="admin-stats-actions">
          <div className="admin-stats-control">
            <label className="admin-label" htmlFor="stats-range">
              Period
            </label>
            <select
              id="stats-range"
              className="admin-select"
              value={statsRange}
              onChange={(event) => setStatsRange(event.target.value)}
            >
              {STATS_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="admin-collapse-btn"
            onClick={() => setStatsExpanded((prev) => !prev)}
            aria-expanded={statsExpanded}
          >
            {statsExpanded ? "Dölj" : "Visa"}
            <span
              className={`admin-collapse-icon ${
                statsExpanded ? "" : "collapsed"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {statsExpanded && (
        <>
          {statsLoading && (
            <div className="admin-loading-block">
              <LoadingSpinner size="small" text="Laddar statistik..." />
            </div>
          )}

          {statsError && <p className="admin-error">{statsError}</p>}

          <div className="admin-stats">
            <div className="admin-stat-card">
              <p className="admin-stat-label">Ordrar i period</p>
              <p className="admin-stat-value">{statsSummary.totalOrders}</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label">Omsättning (betald)</p>
              <p className="admin-stat-value">
                {formatAmount(statsSummary.paidTotal)}
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label">Snittorder</p>
              <p className="admin-stat-value">
                {formatAmount(statsSummary.averageOrder)}
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label">Sålda produkter</p>
              <p className="admin-stat-value">{statsSummary.totalItems}</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label">Varuvärde</p>
              <p className="admin-stat-value">
                {formatAmount(statsSummary.itemsTotal)}
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-label">Största kategori</p>
              <p className="admin-stat-value">
                {topCategory ? topCategory.category : "—"}
              </p>
              {topCategory && (
                <p className="admin-stat-subvalue">
                  {Math.round((topCategory.shareRevenue || 0) * 100)}% av
                  omsättning
                </p>
              )}
            </div>
          </div>

          {/* Sales Chart */}
          {statsSummary.series && statsSummary.series.length > 0 && (
            <div className="admin-panel" style={{ marginBottom: "2rem" }}>
              <h3>Försäljning över tid</h3>
              <div className="admin-chart">
                {(() => {
                  const maxRevenue =
                    Math.max(...statsSummary.series.map((s) => s.revenue)) || 1;
                  return statsSummary.series.map((point) => {
                    const height = (point.revenue / maxRevenue) * 100;
                    return (
                      <div key={point.date} className="chart-bar-container">
                        <div className="chart-tooltip">
                          {point.date}: {formatAmount(point.revenue)} (
                          {point.orderCount} ordrar)
                        </div>
                        <div
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="chart-label">
                          {point.date.slice(5)}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </>
      )}

      <div className="admin-category-panel" id="admin-categories">
        <div className="admin-category-header">
          <div>
            <h3>Kategori-mix</h3>
            <p className="admin-muted">Andel av omsättning</p>
          </div>
          <button
            type="button"
            className="admin-collapse-btn"
            onClick={() => setCategoryExpanded((prev) => !prev)}
            aria-expanded={categoryExpanded}
          >
            {categoryExpanded ? "Dölj" : "Visa"}
            <span
              className={`admin-collapse-icon ${
                categoryExpanded ? "" : "collapsed"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
        {categoryExpanded && (
          <>
            {statsSummary.categories.length > 0 && (
              <div className="admin-category-legend">
                {statsSummary.categories.slice(0, 5).map((category) => (
                  <div
                    className="admin-category-legend-item"
                    key={category.category}
                  >
                    <span className="admin-category-dot" />
                    <span>{category.category}</span>
                  </div>
                ))}
              </div>
            )}
            {!statsLoading &&
              !statsError &&
              statsSummary.categories.length === 0 && (
                <div className="admin-empty">
                  <p>Ingen statistik att visa ännu.</p>
                </div>
              )}
            {statsSummary.categories.length > 0 && (
              <div className="admin-category-list">
                {statsSummary.categories.map((category) => {
                  const share = Math.round((category.shareRevenue || 0) * 100);
                  return (
                    <div className="admin-category-row" key={category.category}>
                      <div className="admin-category-info">
                        <p className="admin-category-name">
                          {category.category}
                        </p>
                        <p className="admin-category-meta">
                          {formatAmount(category.revenue)} · {category.count} st
                        </p>
                      </div>
                      <div className="admin-category-bar">
                        <span style={{ width: `${share}%` }} />
                      </div>
                      <span className="admin-category-share">{share}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default AdminStats;
