import PropTypes from "prop-types";
import { ArrowRight, PackageCheck, PackageOpen, Store } from "lucide-react";

const QUEUE_ITEMS = [
  {
    key: "new",
    label: "Nya ordrar",
    hint: "Behöver granskas",
    Icon: PackageOpen,
  },
  {
    key: "ship",
    label: "Att skicka",
    hint: "Redo för packning",
    Icon: PackageCheck,
  },
  {
    key: "pickup_ready",
    label: "För hämtning",
    hint: "Väntar i butiken",
    Icon: Store,
  },
];

export default function AdminOverviewQueue({ counts, onOpen }) {
  return (
    <section className="admin-overview-queue" aria-labelledby="admin-work-queue-title">
      <div className="admin-overview-queue-heading">
        <div>
          <p className="admin-workspace-kicker">Att göra</p>
          <h2 id="admin-work-queue-title">Orderflöde</h2>
        </div>
        <span>{counts.all || 0} ordrar totalt</span>
      </div>
      <div className="admin-overview-queue-grid">
        {QUEUE_ITEMS.map(({ key, label, hint, Icon }) => (
          <button key={key} type="button" onClick={() => onOpen(key)}>
            <span className="admin-overview-queue-icon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span>
              <strong>{counts[key] || 0}</strong>
              <small>{label}</small>
              <em>{hint}</em>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

AdminOverviewQueue.propTypes = {
  counts: PropTypes.shape({
    all: PropTypes.number,
    new: PropTypes.number,
    ship: PropTypes.number,
    pickup_ready: PropTypes.number,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
};
