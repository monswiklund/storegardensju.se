import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatAmount, formatDateTime } from "../adminUtils";
import { AdminState } from "./ui/AdminUI";

function AdminCustomers({ orders, loading }) {
  const [sortField, setSortField] = useState("totalSpend"); // totalSpend, orderCount, lastOrder
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState(() => new Set());
  const [hidePolicy, setHidePolicy] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());

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
    const filtered = list.filter((c) => {
      const email = c.email.toLowerCase();
      const name = c.name.toLowerCase();
      const phone = c.phone || "";
      return email.includes(q) || name.includes(q) || phone.includes(q);
    });

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

  const toggleReveal = (email) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  };

  const toggleExpanded = (email) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  };

  const maskEmail = (email) => {
    if (!email) return "—";
    const [name, domain] = email.split("@");
    if (!domain) return "—";
    const safeName =
      name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}***`;
    const domainParts = domain.split(".");
    const safeDomain = domainParts.length
      ? `${domainParts[0].slice(0, 2)}***.${domainParts.slice(1).join(".") || "se"}`
      : "***";
    return `${safeName}@${safeDomain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return "—";
    const clean = phone.replace(/\s+/g, "");
    if (clean.length <= 4) return "****";
    return `${clean.slice(0, 3)} **** ${clean.slice(-2)}`;
  };

  if (loading && customers.length === 0) {
    return (
      <AdminState
        type="loading"
        title="Laddar kunder"
        message="Sammanställer kundernas köp och senaste aktivitet."
      />
    );
  }

  return (
    <section className="admin-workspace admin-customers-view" id="admin-customers">
      <div className="admin-workspace-header">
        <div>
          <p className="admin-workspace-kicker">CRM</p>
          <h2>Kunder</h2>
          <p>{customers.length} kunder matchar aktuell sökning.</p>
        </div>
        <span className="admin-count-badge">{customers.length} st</span>
      </div>

      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <input
            type="search"
            className="admin-input admin-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök på namn, e-post eller telefon..."
            aria-label="Sök kunder"
          />
        </div>
        <div className="admin-filters-group">
          <select 
            className="admin-select admin-select-sm"
            value={`${sortField}-${sortDesc}`}
            onChange={(e) => {
              const [field, desc] = e.target.value.split("-");
              setSortField(field);
              setSortDesc(desc === "true");
            }}
          >
            <option value="totalSpend-true">Mest spenderat</option>
            <option value="orderCount-true">Flest ordrar</option>
            <option value="lastOrder-true">Senaste köp</option>
            <option value="lastOrder-false">Äldsta köp</option>
          </select>
        </div>
      </div>

      {!hidePolicy && (
        <div className="admin-policy-banner">
          <div className="admin-policy-text">
            <strong>GDPR:</strong> Personuppgifter visas endast för
            orderhantering. Klicka på ögon-ikonen för att se fullständiga uppgifter.
          </div>
          <button
            type="button"
            className="admin-clear-btn"
            onClick={() => setHidePolicy(true)}
          >
            Stäng
          </button>
        </div>
      )}

      <div className="admin-section-card admin-customer-table-card">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th><button type="button" className="admin-table-sort" onClick={() => handleSort("name")}>Namn</button></th>
              <th><button type="button" className="admin-table-sort" onClick={() => handleSort("email")}>E-post / telefon</button></th>
              <th><button type="button" className="admin-table-sort" onClick={() => handleSort("orderCount")}>Ordrar</button></th>
              <th><button type="button" className="admin-table-sort" onClick={() => handleSort("totalSpend")}>Totalt köpt</button></th>
              <th><button type="button" className="admin-table-sort" onClick={() => handleSort("lastOrder")}>Senaste köp</button></th>
              <th className="admin-table-actions-header">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const isRevealed = revealed.has(c.email);
              const isExpanded = expanded.has(c.email);
              
              return (
                <Fragment key={c.email}>
                  <tr className={isExpanded ? "is-expanded" : ""}>
                    <td>
                      <div className="admin-customer-name-cell">
                        <span className="admin-customer-name-text">{c.name || "Okänd kund"}</span>
                        {c.orderCount > 1 && <span className="admin-chip admin-chip-new" style={{ fontSize: '10px', padding: '2px 6px' }}>Återkommande</span>}
                      </div>
                    </td>
                    <td>
                      <div className="admin-customer-contact-cell">
                        <span className="admin-customer-email-text">
                          {isRevealed ? c.email : maskEmail(c.email)}
                        </span>
                        <span className="admin-customer-phone-text">
                          {isRevealed ? c.phone : maskPhone(c.phone)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-table-stat">{c.orderCount} st</span>
                    </td>
                    <td>
                      <span className="admin-table-stat font-bold">{formatAmount(c.totalSpend)}</span>
                    </td>
                    <td>
                      <span className="admin-table-date">{formatDateTime(c.lastOrder)}</span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className={`admin-table-action-btn ${isRevealed ? "active" : ""}`}
                          onClick={() => toggleReveal(c.email)}
                          title={isRevealed ? "Dölj detaljer" : "Visa fullständiga uppgifter"}
                        >
                          {isRevealed ? (
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                        </button>
                        <button
                          type="button"
                          className={`admin-table-action-btn ${isExpanded ? "active" : ""}`}
                          onClick={() => toggleExpanded(c.email)}
                          title={isExpanded ? "Dölj historik" : "Visa historik"}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="admin-table-expanded-row">
                      <td colSpan="6">
                        <div className="admin-customer-expanded-content fade-in">
                          <div className="admin-customer-expanded-grid">
                            <div className="admin-customer-expanded-info">
                              <span className="admin-label">Stripe Kund-ID</span>
                              <span className="admin-text-mono">
                                {c.ids && c.ids.size > 0 ? Array.from(c.ids).join(", ") : "—"}
                              </span>
                            </div>
                            <div className="admin-customer-expanded-orders">
                              <span className="admin-label">Senaste ordrar</span>
                              <div className="admin-mini-order-list">
                                {orders
                                  .filter((o) => o.customerEmail === c.email)
                                  .sort((a, b) => b.created - a.created)
                                  .slice(0, 5)
                                  .map((o) => (
                                    <div key={o.id} className="admin-mini-order-item">
                                      <span className="admin-mini-order-date">{formatDateTime(o.created)}</span>
                                      <span className="admin-mini-order-amount">{formatAmount(o.amountTotal)}</span>
                                      <Link
                                        to={`/admin?view=orders&order=${o.id}`}
                                        className="admin-link-btn admin-link-sm"
                                      >
                                        #{o.id.slice(-6)}
                                      </Link>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && (
          <AdminState
            title={search ? "Inga kunder matchar" : "Inga kunder ännu"}
            message={
              search
                ? "Prova ett annat namn, en annan e-postadress eller telefon."
                : "Kunder visas här när den första ordern har kommit in."
            }
          />
        )}
      </div>
      </div>
    </section>
  );
}

export default AdminCustomers;
