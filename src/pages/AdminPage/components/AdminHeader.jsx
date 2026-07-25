import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { ExternalLink, Menu, UserRound } from "lucide-react";

const ADMIN_VIEW_COPY = {
  overview: {
    title: "Översikt",
    subtitle: "Dagens läge för försäljning, ordrar och lager.",
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
  onSwitchAccount,
  adminView,
  onToggleSidebar,
}) {
  const copy = ADMIN_VIEW_COPY[adminView] || ADMIN_VIEW_COPY.overview;
  return (
    <header className="admin-header">
      {isPreview && (
        <div className="admin-preview-banner">
          Demo – exempeldata
        </div>
      )}
      <button
        type="button"
        className="admin-mobile-menu"
        onClick={onToggleSidebar}
        aria-label="Öppna adminmenyn"
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      <div className="admin-header-main">
        <div className="admin-header-title-group">
          <span className="admin-header-context">Arbetsyta</span>
          <h1>{copy.title}</h1>
          <p className="admin-header-subtitle">{copy.subtitle}</p>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-header-action"
            onClick={onSwitchAccount}
            title="Byt konto"
          >
            <UserRound size={18} aria-hidden="true" />
            <span className="admin-btn-text">Byt konto</span>
          </button>

          <Link
            to="/"
            className="admin-header-action"
            title="Öppna webbplatsen"
          >
            <ExternalLink size={18} aria-hidden="true" />
            <span className="admin-btn-text">Visa webbplatsen</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

AdminHeader.propTypes = {
  isPreview: PropTypes.bool,
  onSwitchAccount: PropTypes.func.isRequired,
  adminView: PropTypes.string.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};

export default AdminHeader;
