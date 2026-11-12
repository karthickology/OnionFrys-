
function formatDate(value) {
  if (!value) return "No purchases yet";

  return new Date(value).toLocaleDateString("en-GB", {
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

  const registeredDays =
    (Date.now() - new Date(customer.registration_date).getTime()) /
    (1000 * 60 * 60 * 24);

  if (registeredDays <= 30) return "New";

  const daysSincePurchase =
    (Date.now() - new Date(customer.last_purchase).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysSincePurchase > 90) return "At risk";

  return "Active";
}

export default function AdminCustomers({
  initialCustomers,
  initialOrders,
}) {
  const customers = initialCustomers || [];
  const orders = initialOrders || [];

  const segmentCounts = customers.reduce((counts, customer) => {
    const segment = getCustomerSegment(customer);
    counts[segment] = (counts[segment] || 0) + 1;
    return counts;
  }, {});

  return (
    <section className="admin-card">
      <span className="pill">MODULE 5B + 5C</span>
      <h2>Customer CRM</h2>
      <p className="muted">
        Customer profiles, spending, purchase history and segmentation.
      </p>

      <p>
        <strong>Total customers:</strong> {customers.length}
      </p>

      <h3>Customer segments</h3>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "20px"
      }}>
        {Object.entries(segmentCounts).map(([segment, count]) => (
          <span
            key={segment}
            className="pill"
            style={{ padding: "8px 12px" }}
          >
            {segment}: {count}
          </span>
        ))}
      </div>

      {customers.length === 0 ? (
        <p className="muted">No customers found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            minWidth: "850px"
          }}>
            <thead>
              <tr>
                {[
                  "Customer",
                  "Email",
                  "Segment",
                  "Registered",
                  "Paid orders",
                  "Total spent",
                  "Last purchase",
                  "History"
                ].map((heading) => (
                  <th key={heading} style={{
                    padding: "12px 10px",
                    borderBottom: "1px solid var(--border, #ddd)"
                  }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => {
                const customerOrders = orders.filter(
                  (order) => order.user_id === customer.customer_id
                );

                const segment = getCustomerSegment(customer);

                return (
                  <tr key={customer.customer_id}>
                    <td style={{ padding: "12px 10px" }}>
                      <strong>{customer.full_name || "Unnamed"}</strong>
                      <div className="muted">
                        {customer.phone || "No phone"}
                      </div>
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {customer.email || "No email"}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      <span className="pill">{segment}</span>
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {formatDate(customer.registration_date)}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {customer.total_paid_orders}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {formatMoney(customer.total_spent)}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {formatDate(customer.last_purchase)}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      <details>
                        <summary style={{ cursor: "pointer" }}>
                          View orders ({customerOrders.length})
                        </summary>

                        {customerOrders.length === 0 ? (
                          <p className="muted">No orders found.</p>
                        ) : (
                          <div style={{ minWidth: "220px" }}>
                            {customerOrders.map((order) => (
                              <div key={order.id} style={{
                                padding: "10px 0",
                                borderBottom: "1px solid var(--border, #ddd)"
                              }}>
                                <strong>
                                  Order #{order.order_number}
                                </strong>
                                <div className="muted">
                                  {formatDate(order.created_at)}
                                </div>
                                <div>
                                  {formatMoney(order.total)} · {order.payment_status}
                                </div>

                                {(order.order_items || []).map((item) => (
                                  <div key={item.id} className="muted">
                                    {item.product_name} × {item.quantity}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
