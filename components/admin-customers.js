
"use client";

import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "No purchases yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function getCustomerSegment(customer) {
  const paidOrders = Number(customer.total_paid_orders || 0);
  const totalSpent = Number(customer.total_spent || 0);

  if (paidOrders === 0) return "No purchase";
  if (totalSpent >= 100) return "High value";
  if (paidOrders >= 2) return "Repeat";

  const registrationDate = new Date(customer.registration_date);
  const registeredDays =
    (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24);

  if (
    customer.registration_date &&
    !Number.isNaN(registrationDate.getTime()) &&
    registeredDays <= 30
  ) {
    return "New";
  }

  const purchaseDate = new Date(customer.last_purchase);
  const daysSincePurchase =
    (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);

  if (
    customer.last_purchase &&
    !Number.isNaN(purchaseDate.getTime()) &&
    daysSincePurchase > 90
  ) {
    return "At risk";
  }

  return "Active";
}

function segmentClass(segment) {
  return `admin-customer-segment ${segment
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
}

export default function AdminCustomers({
  initialCustomers,
  initialOrders,
}) {
  const customers = initialCustomers || [];
  const orders = initialOrders || [];

  const [search, setSearch] = useState("");
  const [activeSegment, setActiveSegment] = useState("All");

  const segmentCounts = useMemo(() => {
    return customers.reduce((counts, customer) => {
      const segment = getCustomerSegment(customer);
      counts[segment] = (counts[segment] || 0) + 1;
      return counts;
    }, {});
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        (customer.full_name || "").toLowerCase().includes(term) ||
        (customer.email || "").toLowerCase().includes(term);

      const matchesSegment =
        activeSegment === "All" ||
        getCustomerSegment(customer) === activeSegment;

      return matchesSearch && matchesSegment;
    });
  }, [customers, search, activeSegment]);

  const segments = [
    "All",
    "New",
    "High value",
    "Repeat",
    "Active",
    "At risk",
    "No purchase",
  ];

  return (
    <section className="admin-customers">
      <div className="admin-customer-stats">
        <div className="admin-stat-card">
          <span>Total customers</span>
          <strong>{customers.length}</strong>
          <small>Registered customers</small>
        </div>

        <div className="admin-stat-card">
          <span>High value</span>
          <strong>{segmentCounts["High value"] || 0}</strong>
          <small>Spent $100 or more</small>
        </div>

        <div className="admin-stat-card">
          <span>Repeat customers</span>
          <strong>{segmentCounts.Repeat || 0}</strong>
          <small>Two or more paid orders</small>
        </div>

        <div className="admin-stat-card">
          <span>No purchase</span>
          <strong>{segmentCounts["No purchase"] || 0}</strong>
          <small>Registered without paid orders</small>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <div className="eyebrow">CUSTOMER RELATIONSHIP MANAGEMENT</div>
            <h2>Customer directory</h2>
            <p className="muted">
              Customer profiles, spending, purchase history and segmentation.
            </p>
          </div>

          <span className="admin-result-count">
            {filteredCustomers.length} of {customers.length} customers
          </span>
        </div>

        <div className="admin-customer-tabs">
          {segments.map((segment) => {
            const count =
              segment === "All"
                ? customers.length
                : segmentCounts[segment] || 0;

            return (
              <button
                key={segment}
                type="button"
                className={
                  activeSegment === segment
                    ? "admin-customer-tab active"
                    : "admin-customer-tab"
                }
                onClick={() => setActiveSegment(segment)}
              >
                {segment}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="admin-customer-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer name or email..."
            aria-label="Search customers"
          />
        </div>

        {customers.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No customers found</h3>
            <p className="muted">Registered customers will appear here.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-products-table admin-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Segment</th>
                  <th>Registered</th>
                  <th>Paid orders</th>
                  <th>Total spent</th>
                  <th>Last purchase</th>
                  <th>Purchase history</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => {
                  const customerOrders = orders.filter(
                    (order) => order.user_id === customer.customer_id
                  );

                  const segment = getCustomerSegment(customer);

                  return (
                    <tr key={customer.customer_id}>
                      <td>
                        <div className="admin-customer-identity">
                          <div className="admin-customer-avatar">
                            {(customer.full_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {customer.full_name || "Unnamed customer"}
                            </strong>
                            <small>{customer.email || "No email"}</small>
                            <small>{customer.phone || "No phone"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={segmentClass(segment)}>
                          {segment}
                        </span>
                      </td>

                      <td>{formatDate(customer.registration_date)}</td>

                      <td>
                        <strong>
                          {Number(customer.total_paid_orders || 0)}
                        </strong>
                      </td>

                      <td>
                        <strong>{formatMoney(customer.total_spent)}</strong>
                      </td>

                      <td>{formatDate(customer.last_purchase)}</td>

                      <td>
                        <details className="admin-customer-history">
                          <summary>
                            View orders ({customerOrders.length})
                          </summary>

                          <div className="admin-customer-history-content">
                            {customerOrders.length === 0 ? (
                              <p className="muted">No orders found.</p>
                            ) : (
                              customerOrders.map((order) => (
                                <div
                                  key={order.id}
                                  className="admin-customer-order"
                                >
                                  <strong>
                                    #{order.order_number || order.id}
                                  </strong>

                                  <span>
                                    {formatDate(order.created_at)}
                                  </span>

                                  <strong>
                                    {formatMoney(order.total)}
                                  </strong>

                                  <span className="admin-muted-label">
                                    Payment: {order.payment_status || "Unknown"}
                                  </span>

                                  {(order.order_items || []).map((item) => (
                                    <small key={item.id}>
                                      {item.product_name} × {item.quantity}
                                    </small>
                                  ))}
                                </div>
                              ))
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="admin-empty-state">
                <h3>No matching customers</h3>
                <p className="muted">
                  Try another search or customer segment.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </section>
  );
}
