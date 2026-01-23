import { ADMIN_VIEW_OPTIONS } from "../adminConstants";

const ADMIN_VIEW_COPY = {
  overview: {
    title: "Admin",
    subtitle: "Snabb översikt av ordrar, statistik och status.",
  },
  stats: {
    title: "Statistik",
    subtitle: "Följ utveckling och intäkter över tid.",
  },
  orders: {
    title: "Ordrar",
    subtitle: "Hantera inkomna ordrar och uppdatera status.",
  },
  customers: {
    title: "Kunder",
    subtitle: "Se köphistorik och återkommande kunder.",
  },
  products: {
    title: "Produkter",
    subtitle: "Skapa, redigera och publicera produkter.",
  },
  gallery: {
    title: "Galleri",
    subtitle: "Ladda upp och organisera galleri-bilder.",
  },
  coupons: {
    title: "Rabatter",
    subtitle: "Skapa och arkivera rabattkoder.",
  },
};

function AdminHeader({
  isPreview,
  listLoading,

  onRefresh,
  onLogout,
  adminView,
  onViewChange,
}) {
  const copy = ADMIN_VIEW_COPY[adminView] || ADMIN_VIEW_COPY.overview;
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
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
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
            Byt admin-nyckel
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
