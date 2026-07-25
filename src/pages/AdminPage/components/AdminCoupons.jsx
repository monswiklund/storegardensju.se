import { useState, useEffect, useCallback } from "react";
import { Ticket } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";
import { AdminService } from "../../../services/adminService";
import { AdminDrawer, AdminDrawerSection, AdminState } from "./ui/AdminUI";
import "./AdminCoupons.css";

const CREATE_COUPON_FORM_ID = "admin-coupon-create-form";
const DISCOUNT_PERCENT = "percent";
const DISCOUNT_FIXED = "fixed";
const MAX_PERCENT_OFF = 100;
const ORE_PER_SEK = 100;
/** Basket total used only to illustrate the discount in the live preview. */
const PREVIEW_BASKET_SEK = 500;

const formatSek = (amount) =>
  `${new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 }).format(amount)} kr`;

export default function AdminCoupons({ adminKey }) {
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // New Coupon Form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState(DISCOUNT_PERCENT);
  const [discountValue, setDiscountValue] = useState("");

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setListError("");
      const params =
        statusFilter === "all"
          ? {}
          : { active: statusFilter === "active" ? "true" : "false" };
      const data = await AdminService.getCoupons(adminKey, params);
      setCoupons(data || []);
    } catch (err) {
      const message = err.message || "Misslyckades hämta koder";
      setListError(message);
      error(message);
    } finally {
      setLoading(false);
    }
  }, [adminKey, error, statusFilter]);

  useEffect(() => {
    if (adminKey) fetchCoupons();
  }, [adminKey, fetchCoupons]);

  const parsedDiscount = Number.parseFloat(discountValue);
  const previewDiscount = Number.isFinite(parsedDiscount) && parsedDiscount > 0
    ? parsedDiscount
    : 0;
  const previewSavings =
    discountType === DISCOUNT_PERCENT
      ? (PREVIEW_BASKET_SEK * Math.min(previewDiscount, MAX_PERCENT_OFF)) / 100
      : Math.min(previewDiscount, PREVIEW_BASKET_SEK);
  const previewTotalAfterDiscount = PREVIEW_BASKET_SEK - previewSavings;
  const previewDiscountLabel =
    previewDiscount > 0
      ? discountType === DISCOUNT_PERCENT
        ? `−${Math.min(previewDiscount, MAX_PERCENT_OFF)}% på hela ordern`
        : `−${formatSek(previewDiscount)} på hela ordern`
      : "Ange ett värde för att se rabatten";

  const resetCreateForm = () => {
    setNewCode("");
    setDiscountValue("");
    setDiscountType(DISCOUNT_PERCENT);
  };

  const closeCreateDrawer = () => {
    if (creating) return;
    resetCreateForm();
    setIsCreateOpen(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      error("Ange ett giltigt värde");
      return;
    }
    
    if (discountType === DISCOUNT_PERCENT && val > MAX_PERCENT_OFF) {
      error(`Procent kan inte vara över ${MAX_PERCENT_OFF}`);
      return;
    }

    setCreating(true);

    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        percentOff: discountType === DISCOUNT_PERCENT ? val : 0,
        amountOff:
          discountType === DISCOUNT_FIXED ? Math.round(val * ORE_PER_SEK) : 0,
      };

      await AdminService.createCoupon(adminKey, payload);
      success(`Koden "${payload.code}" skapad!`);
      resetCreateForm();
      setIsCreateOpen(false);
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
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => setIsCreateOpen(true)}
        >
          + Skapa rabattkod
        </button>
      </div>

      <div className="admin-section-card coupon-list-section">
        <div className="admin-section-card-header">
          <div>
            <h3>Rabattkoder</h3>
            <p>{coupons.length} koder i listan.</p>
          </div>
        </div>
        <div className="form-group coupon-filter">
          <label htmlFor="coupon-status-filter">Visa</label>
          <select
            id="coupon-status-filter"
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
          <AdminState
            type="loading"
            title="Laddar rabattkoder"
            message="Hämtar aktiva och inaktiva koder."
          />
        ) : listError ? (
          <AdminState
            type="error"
            title="Rabattkoderna kunde inte hämtas"
            message={listError}
            action={
              <button type="button" className="admin-btn-secondary" onClick={fetchCoupons}>
                Försök igen
              </button>
            }
          />
        ) : coupons.length === 0 ? (
          <AdminState
            title="Inga rabattkoder hittades"
            message={
              statusFilter === "all"
                ? "Skapa den första koden för att komma igång."
                : "Byt filter för att se övriga rabattkoder."
            }
            action={
              statusFilter === "all" ? (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => setIsCreateOpen(true)}
                >
                  + Skapa rabattkod
                </button>
              ) : null
            }
          />
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

      <AdminDrawer
        open={isCreateOpen}
        size="wide"
        title="Skapa rabattkod"
        description="Koden aktiveras direkt när den skapas."
        icon={<Ticket size={20} aria-hidden="true" />}
        isDirty={Boolean(newCode.trim() || discountValue.trim())}
        onClose={closeCreateDrawer}
        preview={
          <div className="coupon-preview">
            <p className="coupon-preview-code">
              {newCode.trim() || "KOD123"}
            </p>
            <p className="coupon-preview-discount">{previewDiscountLabel}</p>
            <div className="coupon-preview-example">
              <p className="coupon-preview-example-label">
                Räkneexempel på {formatSek(PREVIEW_BASKET_SEK)}
              </p>
              <p className="coupon-preview-example-math">
                <span className="coupon-preview-before">
                  {formatSek(PREVIEW_BASKET_SEK)}
                </span>
                <span aria-hidden="true">→</span>
                <strong>{formatSek(previewTotalAfterDiscount)}</strong>
              </p>
              <p className="coupon-preview-example-note">
                Kunden sparar {formatSek(previewSavings)}.
              </p>
            </div>
          </div>
        }
        footer={
          <>
            <button
              type="submit"
              form={CREATE_COUPON_FORM_ID}
              className="admin-btn-primary"
              disabled={creating}
            >
              {creating ? "Skapar..." : "Skapa kod"}
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={closeCreateDrawer}
              disabled={creating}
            >
              Avbryt
            </button>
          </>
        }
      >
        <form
          id={CREATE_COUPON_FORM_ID}
          className="admin-drawer-form"
          onSubmit={handleCreate}
        >
          <AdminDrawerSection title="Kod" defaultOpen>
            <div className="form-group">
              <label htmlFor="coupon-code">Kod (t.ex. SOMMAR20)</label>
              <input
                id="coupon-code"
                className="admin-input"
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="KOD123"
                required
                maxLength={20}
              />
              <small className="help-text">
                Detta är vad kunden skriver in i kassan. Versaler används alltid.
              </small>
            </div>
          </AdminDrawerSection>

          <AdminDrawerSection title="Rabatt" defaultOpen>
            <div className="form-group">
              <label htmlFor="coupon-type">Typ av rabatt</label>
              <select
                id="coupon-type"
                className="admin-select"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value={DISCOUNT_PERCENT}>Procent (%)</option>
                <option value={DISCOUNT_FIXED}>Kronor (kr)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="coupon-value">Värde</label>
              <input
                id="coupon-value"
                className="admin-input"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === DISCOUNT_PERCENT ? "20" : "100"}
                required
                min="1"
                max={discountType === DISCOUNT_PERCENT ? MAX_PERCENT_OFF : undefined}
              />
            </div>
          </AdminDrawerSection>
        </form>
      </AdminDrawer>
    </div>
  );
}
