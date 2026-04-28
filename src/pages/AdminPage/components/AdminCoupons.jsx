import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../contexts/ToastContext";
import { AdminService } from "../../../services/adminService";
import "./AdminCoupons.css";

export default function AdminCoupons({ adminKey }) {
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // New Coupon Form
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState("percent"); // percent or fixed
  const [discountValue, setDiscountValue] = useState("");

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const params =
        statusFilter === "all"
          ? {}
          : { active: statusFilter === "active" ? "true" : "false" };
      const data = await AdminService.getCoupons(adminKey, params);
      setCoupons(data || []);
    } catch (err) {
      error(err.message || "Misslyckades hämta koder");
    } finally {
      setLoading(false);
    }
  }, [adminKey, error, statusFilter]);

  useEffect(() => {
    if (adminKey) fetchCoupons();
  }, [adminKey, fetchCoupons]);

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      error("Ange ett giltigt värde");
      return;
    }
    
    if (discountType === "percent" && val > 100) {
      error("Procent kan inte vara över 100");
      return;
    }

    setCreating(true);

    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        percentOff: discountType === "percent" ? val : 0,
        amountOff: discountType === "fixed" ? Math.round(val * 100) : 0, // Convert to öre
      };

      await AdminService.createCoupon(adminKey, payload);
      success(`Koden "${payload.code}" skapad!`);
      setNewCode("");
      setDiscountValue("");
      fetchCoupons();
    } catch (err) {
      error(err.message || "Kunde inte skapa kod");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Vill du inaktivera denna kod? Det går inte att ångra.")
    )
      return;
    try {
      await AdminService.archiveCoupon(adminKey, id);
      success("Kod avaktiverad");
      fetchCoupons();
    } catch (err) {
      error(err.message || "Kunde inte ta bort kod");
    }
  };

  return (
    <div className="admin-workspace admin-coupons">
      <div className="admin-workspace-header">
        <div>
          <p className="admin-workspace-kicker">Försäljning</p>
          <h2>Rabatter</h2>
          <p>Skapa och följ upp rabattkoder.</p>
        </div>
      </div>

      <div className="admin-section-card coupon-create-section">
        <div className="admin-section-card-header">
          <div>
            <h3>Skapa ny rabattkod</h3>
            <p>Koden aktiveras direkt när den skapas.</p>
          </div>
        </div>
        <form onSubmit={handleCreate} className="coupon-form">
          <div className="form-group">
            <label>Kod (t.ex. SOMMAR20)</label>
            <input
              className="admin-input"
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="KOD123"
              required
              maxLength={20}
            />
          </div>
          <div className="form-group">
            <label>Typ av rabatt</label>
            <select
              className="admin-select"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percent">Procent (%)</option>
              <option value="fixed">Kronor (kr)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Värde</label>
            <input
              className="admin-input"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percent" ? "20" : "100"}
              required
              min="1"
            />
          </div>
          <button type="submit" className="admin-btn-primary create-btn" disabled={creating}>
            {creating ? "Skapar..." : "Skapa Kod"}
          </button>
        </form>
      </div>

      <div className="admin-section-card coupon-list-section">
        <div className="admin-section-card-header">
          <div>
            <h3>Rabattkoder</h3>
            <p>{coupons.length} koder i listan.</p>
          </div>
        </div>
        <div className="form-group coupon-filter">
          <label>Visa</label>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Alla</option>
            <option value="active">Aktiva</option>
            <option value="inactive">Inaktiva</option>
          </select>
        </div>
        {loading ? (
          <p className="admin-muted">Laddar...</p>
        ) : (
          <table className="coupon-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Rabatt</th>
                <th>Status</th>
                <th>Användningar</th>
                <th>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="5">Inga koder hittades.</td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr key={c.id} className={!c.active ? "archived-row" : ""}>
                  <td>
                    <strong>{c.code}</strong>
                  </td>
                  <td>
                    {c.percentOff > 0
                      ? `${c.percentOff}%`
                      : `${c.amountOff / 100} kr`}
                  </td>
                  <td>
                    {c.active ? (
                      <span className="status-active">Aktiv</span>
                    ) : (
                      <span className="status-archived">Inaktiv</span>
                    )}
                  </td>
                  <td>{c.timesRedeemed} st</td>
                  <td>
                    {c.active && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="admin-btn-danger delete-btn"
                      >
                        Avaktivera
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
