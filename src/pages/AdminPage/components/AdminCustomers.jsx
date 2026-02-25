import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatAmount, formatDateTime } from "../adminUtils";

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
    return <div className="admin-loading-block">Laddar kunder...</div>;
  }

  return (
    <section className="admin-panel admin-customers-view" id="admin-customers">
      <div className="admin-panel-header">
        <div className="admin-header-title">
          <h3>Kundlista</h3>
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
      {!hidePolicy && (
        <div className="admin-policy-banner">
          <div>
            <strong>GDPR:</strong> Personuppgifter visas endast för
            orderhantering. Klicka på “Visa full” för att se kontaktuppgifter.
          </div>
          <button
            type="button"
            className="admin-link-btn"
            onClick={() => setHidePolicy(true)}
          >
            Dölj
          </button>
        </div>
      )}

      <div className="admin-customer-grid-list">
        {customers.map((c) => (
          <div key={c.email} className="admin-customer-card">
            <div className="admin-customer-top">
              <div className="admin-customer-identity">
                <span className="admin-customer-name">
                  {c.name || "Okänd kund"}
                </span>
                <span className="admin-customer-contact">
                  {revealed.has(c.email) ? c.email : maskEmail(c.email)}
                </span>
                <span className="admin-customer-contact">
                  {revealed.has(c.email) ? c.phone : maskPhone(c.phone)}
                </span>
              </div>
              <div className="admin-customer-actions">
                <button
                  type="button"
                  className="admin-btn-secondary admin-btn-sm"
                  onClick={() => toggleReveal(c.email)}
                >
                  {revealed.has(c.email) ? "Dölj detaljer" : "Visa full"}
                </button>
                <button
                  type="button"
                  className="admin-btn-tertiary admin-btn-sm"
                  onClick={() => toggleExpanded(c.email)}
                >
                  {expanded.has(c.email) ? "Dölj historik" : "Visa historik"}
                </button>
              </div>
            </div>

            <div className="admin-customer-stats-row">
              <div className="admin-customer-stat">
                <span className="admin-customer-stat-label">Ordrar</span>
                <span className="admin-customer-stat-value">{c.orderCount}</span>
              </div>
              <div className="admin-customer-stat">
                <span className="admin-customer-stat-label">Totalt köpt</span>
                <span className="admin-customer-stat-value">
                  {formatAmount(c.totalSpend)}
                </span>
              </div>
              <div className="admin-customer-stat">
                <span className="admin-customer-stat-label">Senaste köp</span>
                <span className="admin-customer-stat-value">
                  {formatDateTime(c.lastOrder)}
                </span>
              </div>
            </div>

            <div
              className={`admin-customer-history ${
                expanded.has(c.email) ? "is-expanded" : ""
              }`}
              aria-hidden={!expanded.has(c.email)}
            >
              <div className="admin-customer-history-inner">
                <div className="admin-customer-history-item">
                  <span className="admin-customer-history-label">Stripe kund-ID</span>
                  <span className="admin-customer-history-value">
                    {c.ids && c.ids.size > 0 ? Array.from(c.ids).join(", ") : "—"}
                  </span>
                </div>
                <div className="admin-customer-history-orders">
                  <h4>Senaste ordrar</h4>
                  <ul>
                    {orders
                      .filter((o) => o.customerEmail === c.email)
                      .sort((a, b) => b.created - a.created)
                      .slice(0, 5)
                      .map((o) => (
                        <li key={o.id}>
                          <span>{formatDateTime(o.created)}</span>
                          <span>{formatAmount(o.amountTotal)}</span>
                          <Link
                            to={`/admin?view=orders&order=${o.id}`}
                            className="admin-customer-order-link"
                          >
                            #{o.id.slice(-6)}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="admin-empty">Inga kunder hittades.</div>
        )}
      </div>
    </section>
  );
}

export default AdminCustomers;
