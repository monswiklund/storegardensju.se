import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { AdminService } from "../../../services/adminService";
import { useToast } from "../../../contexts/ToastContext";
import "./AdminProductList.css";

export default function AdminProductList({ adminKey, onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("name");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({
    price: "",
    stock: "",
    category: "",
    active: true,
  });
  const { success, error } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      if (statusFilter === "all") {
        const [active, archived] = await Promise.all([
          AdminService.getProducts(adminKey, { archived: "false" }),
          AdminService.getProducts(adminKey, { archived: "true" }),
        ]);
        setProducts([...(active || []), ...(archived || [])]);
      } else {
        const data = await AdminService.getProducts(adminKey, {
          archived: statusFilter === "archived" ? "true" : "false",
        });
        setProducts(data || []);
      }
    } catch (err) {
      setErrorMsg(err.message || "Kunde inte hämta produkter");
    } finally {
      setLoading(false);
    }
  }, [adminKey, statusFilter]);

  useEffect(() => {
    if (!adminKey) {
      setLoading(false);
      setProducts([]);
      setErrorMsg("Saknar admin-nyckel. Logga in igen.");
      return;
    }
    fetchProducts();
  }, [adminKey, fetchProducts]);

  useEffect(() => {
    setSelectedIds(new Set());
    setEditingId("");
  }, [statusFilter, categoryFilter, query]);

  const handleArchive = async (id, name) => {
    if (
      !window.confirm(
        `Är du säker på att du vill arkivera "${name}"? Den kommer försvinna från butiken.`
      )
    )
      return;

    try {
      await AdminService.archiveProduct(adminKey, id);
      success(`Produkt arkiverad${name ? `: ${name}` : ""}`);
      fetchProducts();
    } catch (err) {
      error(err.message || "Kunde inte arkivera produkt");
    }
  };

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sv"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = [...products];
    if (categoryFilter !== "all") {
      next = next.filter((p) => p.category === categoryFilter);
    }
    if (lowStockOnly) {
      next = next.filter((p) => Number(p.stock || 0) <= 1);
    }
    if (q) {
      next = next.filter((p) => {
        return (
          (p.name || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.artist || "").toLowerCase().includes(q)
        );
      });
    }
    next.sort((a, b) => {
      if (sortMode === "price") return (a.price || 0) - (b.price || 0);
      if (sortMode === "stock") return Number(a.stock || 0) - Number(b.stock || 0);
      return (a.name || "").localeCompare(b.name || "", "sv");
    });
    return next;
  }, [products, categoryFilter, lowStockOnly, query, sortMode]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Arkivera ${selectedIds.size} produkter?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          AdminService.archiveProduct(adminKey, id)
        )
      );
      success(`${selectedIds.size} produkter arkiverade`);
      setSelectedIds(new Set());
      fetchProducts();
    } catch (err) {
      error(err.message || "Kunde inte arkivera produkter");
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    if (!bulkCategory && bulkStock === "") return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => {
          const data = new FormData();
          if (bulkCategory) data.append("category", bulkCategory);
          if (bulkStock !== "") data.append("stock", String(bulkStock));
          return AdminService.updateProduct(adminKey, id, data);
        })
      );
      const changes = [];
      if (bulkCategory) changes.push(`kategori: ${bulkCategory}`);
      if (bulkStock !== "") changes.push(`lager: ${bulkStock}`);
      success(
        `${selectedIds.size} produkter uppdaterade${
          changes.length ? ` (${changes.join(", ")})` : ""
        }`
      );
      setSelectedIds(new Set());
      setBulkCategory("");
      setBulkStock("");
      fetchProducts();
    } catch (err) {
      error(err.message || "Kunde inte uppdatera produkter");
    }
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      price: product.price ? String(product.price / 100) : "",
      stock: product.stock || "0",
      category: product.category || "",
      active: product.active,
    });
  };

  const handleSaveEdit = async (product) => {
    const data = new FormData();
    const changes = [];
    if (editForm.price !== "") {
      data.append("price", editForm.price);
      const previous = product.price ? product.price / 100 : 0;
      const next = Number(editForm.price);
      if (!Number.isNaN(next) && next !== previous) {
        changes.push(`pris: ${previous} → ${next} kr`);
      }
    }
    if (editForm.stock !== "") {
      data.append("stock", editForm.stock);
      const prevStock = Number(product.stock || 0);
      const nextStock = Number(editForm.stock);
      if (!Number.isNaN(nextStock) && nextStock !== prevStock) {
        changes.push(`lager: ${prevStock} → ${nextStock}`);
      }
    }
    if (editForm.category && editForm.category !== product.category) {
      data.append("category", editForm.category);
      changes.push(`kategori: ${product.category || "—"} → ${editForm.category}`);
    }
    data.append("active", editForm.active ? "true" : "false");
    try {
      await AdminService.updateProduct(adminKey, product.id, data);
      success(
        `Produkt uppdaterad${changes.length ? ` (${changes.join(", ")})` : ""}`
      );
      setEditingId("");
      fetchProducts();
    } catch (err) {
      error(err.message || "Kunde inte uppdatera produkt");
    }
  };

  const handleRestore = async (product) => {
    const data = new FormData();
    data.append("active", "true");
    try {
      await AdminService.updateProduct(adminKey, product.id, data);
      success(
        `Produkt återställd${product?.name ? `: ${product.name}` : ""}`
      );
      fetchProducts();
    } catch (err) {
      error(err.message || "Kunde inte återställa produkt");
    }
  };

  if (loading) return <div>Laddar produkter...</div>;
  if (errorMsg) return <div className="error-message">{errorMsg}</div>;

  return (
    <div className="admin-product-list">
      <div className="apl-header">
        <div>
          <h3>Produktlista</h3>
          <p className="apl-subtitle">
            {filteredProducts.length} av {products.length} produkter
          </p>
        </div>
        <div className="apl-controls">
          <input
            type="search"
            className="apl-search"
            placeholder="Sök namn, kategori eller konstnär"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="apl-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="active">Aktiva</option>
            <option value="archived">Arkiverade</option>
            <option value="all">Alla</option>
          </select>
          <select
            className="apl-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Alla kategorier</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <label className="apl-checkbox">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) => setLowStockOnly(event.target.checked)}
            />
            Lågt lager
          </label>
          <select
            className="apl-select"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
          >
            <option value="name">Sortera: Namn</option>
            <option value="price">Sortera: Pris</option>
            <option value="stock">Sortera: Lager</option>
          </select>
        </div>
      </div>
      <div className="apl-bulk-bar">
        <label className="apl-checkbox">
          <input
            type="checkbox"
            checked={
              filteredProducts.length > 0 &&
              selectedIds.size === filteredProducts.length
            }
            onChange={handleSelectAll}
          />
          Markera alla
        </label>
        <div className="apl-bulk-actions">
          <select
            className="apl-select"
            value={bulkCategory}
            onChange={(event) => setBulkCategory(event.target.value)}
          >
            <option value="">Bulk: kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            className="apl-input"
            type="number"
            min="0"
            placeholder="Bulk: lager"
            value={bulkStock}
            onChange={(event) => setBulkStock(event.target.value)}
          />
          <button
            type="button"
            className="apl-btn-apply"
            onClick={handleBulkUpdate}
            disabled={selectedIds.size === 0}
          >
            Uppdatera valda
          </button>
          <button
            type="button"
            className="apl-btn-archive"
            onClick={handleBulkArchive}
            disabled={selectedIds.size === 0}
          >
            Arkivera valda
          </button>
          <span className="apl-selected-count">
            {selectedIds.size} valda
          </span>
        </div>
      </div>
      <table className="apl-table">
        <thead>
          <tr>
            <th></th>
            <th>Bild</th>
            <th>Namn</th>
            <th>Lager</th>
            <th>Pris</th>
            <th>Status</th>
            <th>Åtgärder</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <Fragment key={p.id}>
              <tr key={p.id} className={!p.active ? "archived-row" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => handleToggleSelect(p.id)}
                  />
                </td>
                <td>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="apl-thumb" />
                  ) : (
                    <div className="apl-no-img">Ingen bild</div>
                  )}
                </td>
                <td className="apl-name-cell">
                  <strong>{p.name}</strong>
                  <span className="apl-category">{p.category}</span>
                </td>
                <td>{p.stock || "0"}</td>
                <td>{(((p.price || 0) / 100) || 0).toFixed(0)} kr</td>
                <td>
                  {p.active ? (
                    <span className="status-active">Aktiv</span>
                  ) : (
                    <span className="status-archived">Arkiverad</span>
                  )}
                </td>
                <td className="apl-actions">
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="apl-btn-edit"
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="apl-btn-inline"
                  >
                    Snabbedit
                  </button>
                  {p.active ? (
                    <button
                      type="button"
                      onClick={() => handleArchive(p.id, p.name)}
                      className="apl-btn-archive"
                    >
                      Arkivera
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRestore(p)}
                      className="apl-btn-restore"
                    >
                      Återställ
                    </button>
                  )}
                </td>
              </tr>
              {editingId === p.id && (
                <tr key={`${p.id}-edit`} className="apl-edit-row">
                  <td colSpan={7}>
                    <div className="apl-edit-panel">
                      <div className="apl-edit-field">
                        <label>Pris (SEK)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editForm.price}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              price: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="apl-edit-field">
                        <label>Lager</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editForm.stock}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              stock: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="apl-edit-field">
                        <label>Kategori</label>
                        <select
                          value={editForm.category}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              category: event.target.value,
                            }))
                          }
                        >
                          <option value="">Välj kategori</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <label className="apl-checkbox">
                        <input
                          type="checkbox"
                          checked={editForm.active}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              active: event.target.checked,
                            }))
                          }
                        />
                        Aktiv
                      </label>
                      <div className="apl-edit-actions">
                        <button
                          type="button"
                          className="apl-btn-apply"
                          onClick={() => handleSaveEdit(p)}
                        >
                          Spara
                        </button>
                        <button
                          type="button"
                          className="apl-btn-edit"
                          onClick={() => setEditingId("")}
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan={7} className="apl-empty">
                Inga produkter matchar filtren.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
