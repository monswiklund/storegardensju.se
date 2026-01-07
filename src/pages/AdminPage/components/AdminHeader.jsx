import { ADMIN_VIEW_OPTIONS } from "../adminConstants";

function AdminHeader({
  isPreview,
  listLoading,

  onRefresh,
  onLogout,
  adminView,
  onViewChange,
}) {
  return (
    <>
      {isPreview && (
        <div className="admin-preview-banner">
          <strong>Demo-läge:</strong> Detta är en förhandsvisning med
          exempeldata.
        </div>
      )}
      <div className="admin-header">
        <div>
          <h1>Admin</h1>
          <p>Hantera ordrar för webbshoppen.</p>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={onRefresh}
            disabled={listLoading}
          >
            {listLoading ? "Uppdaterar..." : "Uppdatera"}
          </button>

          <button
            type="button"
            className="admin-btn-tertiary"
            onClick={onLogout}
          >
            Logga ut
          </button>
        </div>
      </div>

      <div className="admin-view-tabs">
        {ADMIN_VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`admin-view-tab ${
              adminView === option.value ? "active" : ""
            }`}
            onClick={() => onViewChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default AdminHeader;
