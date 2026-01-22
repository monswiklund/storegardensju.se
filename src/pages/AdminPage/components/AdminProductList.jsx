import { useState, useEffect } from "react";
import "./AdminProductList.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

export default function AdminProductList({ adminKey, onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Kunde inte hämta produkter");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) fetchProducts();
  }, [adminKey]);

  const handleArchive = async (id, name) => {
    if (
      !window.confirm(
        `Är du säker på att du vill arkivera "${name}"? Den kommer försvinna från butiken.`
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Kunde inte arkivera produkt");

      // Refresh list
      fetchProducts();
    } catch (err) {
      alert("Fel vid arkivering: " + err.message);
    }
  };

  if (loading) return <div>Laddar produkter...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-product-list">
      <div className="apl-header">
        <h3>Alla Produkter</h3>
      </div>
      <table className="apl-table">
        <thead>
          <tr>
            <th>Bild</th>
            <th>Namn</th>
            <th>Lager</th>
            <th>Pris</th>
            <th>Status</th>
            <th>Åtgärder</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={!p.active ? "archived-row" : ""}>
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
              <td>{(p.price / 100).toFixed(0)} kr</td>
              <td>
                {p.active ? (
                  <span className="status-active">Aktiv</span>
                ) : (
                  <span className="status-archived">Arkiverad</span>
                )}
              </td>
              <td className="apl-actions">
                <button onClick={() => onEdit(p)} className="apl-btn-edit">
                  Redigera
                </button>
                {p.active && (
                  <button
                    onClick={() => handleArchive(p.id, p.name)}
                    className="apl-btn-archive"
                  >
                    Arkivera
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
