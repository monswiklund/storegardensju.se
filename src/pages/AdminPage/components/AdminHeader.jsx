import { Link } from "react-router-dom";
import { ADMIN_VIEW_OPTIONS } from "../adminConstants";
import { RefreshCw, User, ArrowLeft } from "lucide-react";

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
  events: {
    title: "Evenemang",
    subtitle: "Hantera kommande och tidigare händelser.",
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
  onSwitchAccount,
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
        <div className="admin-header-title-group">
          <div>
            <h1>{copy.title}</h1>
            <p className="admin-header-subtitle">{copy.subtitle}</p>
          </div>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn-secondary admin-icon-btn"
            onClick={onRefresh}
            disabled={listLoading}
            title="Uppdatera"
          >
            <RefreshCw size={18} className={listLoading ? "spin" : ""} />
            <span className="admin-btn-text">{listLoading ? "Uppdaterar..." : "Uppdatera"}</span>
          </button>

          <button
            type="button"
            className="admin-btn-tertiary admin-icon-btn"
            onClick={onSwitchAccount}
            title="Byt konto"
          >
            <User size={18} />
            <span className="admin-btn-text">Byt konto</span>
          </button>

          <Link to="/" className="admin-btn-tertiary admin-icon-btn admin-home-link" title="Till hemsidan">
            <ArrowLeft size={18} />
            <span className="admin-btn-text">Till hemsidan</span>
          </Link>
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
