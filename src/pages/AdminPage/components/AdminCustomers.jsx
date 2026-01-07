import { useMemo, useState } from "react";
import { formatAmount, formatDateTime } from "../adminUtils";

function AdminCustomers({ orders, loading }) {
  const [sortField, setSortField] = useState("totalSpend"); // totalSpend, orderCount, lastOrder
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState("");

  const customers = useMemo(() => {
    const map = new Map();

    orders.forEach((order) => {
      const email = order.customerEmail;
      if (!email) return;

      if (!map.has(email)) {
        map.set(email, {
          email,
          name: order.customerName || order.shippingDetails?.name || "",
          phone: order.customerPhone || "",
          totalSpend: 0,
          orderCount: 0,
          lastOrder: 0,
          currency: order.currency,
          ids: new Set(),
        });
      }

      const cust = map.get(email);
      cust.totalSpend += order.amountTotal || 0;
      cust.orderCount += 1;
      cust.ids.add(order.customerId); // Tracking Stripe Customer IDs
      if ((order.created || 0) > cust.lastOrder) {
        cust.lastOrder = order.created;
        // Update name/phone from latest order if missing
        if (!cust.name && order.customerName) cust.name = order.customerName;
        if (!cust.phone && order.customerPhone)
          cust.phone = order.customerPhone;
      }
    });

    const list = Array.from(map.values());

    // Filter
    const q = search.toLowerCase();
    const filtered = list.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );

    // Sort
    filtered.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });

    return filtered;
  }, [orders, search, sortField, sortDesc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  if (loading && customers.length === 0) {
    return <div className="admin-loading-block">Laddar kunder...</div>;
  }

  return (
    <section className="admin-panel admin-customers-view" id="admin-customers">
      <div className="admin-panel-header">
        <div className="admin-header-title">
          <h2>Kunder</h2>
          <span className="admin-count-badge">{customers.length} st</span>
        </div>
        <div className="admin-search-wrapper" style={{ maxWidth: "300px" }}>
          <input
            type="search"
            className="admin-input admin-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök kund..."
          />
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("email")}>Email</th>
              <th onClick={() => handleSort("name")}>Namn</th>
              <th onClick={() => handleSort("orderCount")}>Ordrar</th>
              <th onClick={() => handleSort("totalSpend")}>Totalt köpt</th>
              <th onClick={() => handleSort("lastOrder")}>Senaste köp</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{c.email}</span>
                    <span style={{ fontSize: "11px", color: "#999" }}>
                      {c.phone}
                    </span>
                  </div>
                </td>
                <td>{c.name || "—"}</td>
                <td>{c.orderCount}</td>
                <td>{formatAmount(c.totalSpend)}</td>
                <td>{formatDateTime(c.lastOrder)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Inga kunder hittades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminCustomers;
