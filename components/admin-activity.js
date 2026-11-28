
function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value, currency = "AED") {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: currency || "AED",
  }).format(Number(value || 0));
}

function statusClass(status) {
  return `admin-order-status ${String(status || "unknown").toLowerCase()}`;
}

export default function AdminActivity({
  carts,
  cartsError,
  automationLogs,
  logsError,
}) {
  const allCarts = carts || [];
  const allLogs = automationLogs || [];

  return (
    <div className="admin-activity-grid">
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Recent customer carts</h2>
            <p className="muted">
              Monitor customer cart activity and potential lost sales.
            </p>
          </div>
          <span className="admin-result-count">
            {allCarts.length} carts
          </span>
        </div>

        {cartsError ? (
          <p>Unable to load carts: {cartsError.message}</p>
        ) : allCarts.length === 0 ? (
          <div className="admin-empty-state">
            <p>No customer carts found.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-products-table admin-activity-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Cart value</th>
                  <th>Last activity</th>
                </tr>
              </thead>

              <tbody>
                {allCarts.slice(0, 10).map((cart) => (
                  <tr key={cart.id}>
                    <td>
                      <strong>
                        {cart.email || "Unknown customer"}
                      </strong>
                    </td>

                    <td>
                      <span className={statusClass(cart.status)}>
                        {cart.status || "Unknown"}
                      </span>
                    </td>

                    <td>
                      {Array.isArray(cart.items)
                        ? cart.items.length
                        : 0}
                    </td>

                    <td>
                      <strong>
                        {formatMoney(cart.subtotal, cart.currency)}
                      </strong>
                    </td>

                    <td>{formatDate(cart.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Automation activity</h2>
            <p className="muted">
              Track recent automated customer-retention activity.
            </p>
          </div>
          <span className="admin-result-count">
            {allLogs.length} executions
          </span>
        </div>

        {logsError ? (
          <p>Unable to load automation logs: {logsError.message}</p>
        ) : allLogs.length === 0 ? (
          <div className="admin-empty-state">
            <p>No automation executions recorded yet.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-products-table admin-activity-table">
              <thead>
                <tr>
                  <th>Automation</th>
                  <th>Status</th>
                  <th>Executed at</th>
                </tr>
              </thead>

              <tbody>
                {allLogs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td>
                      <strong>
                        {String(log.automation_type || "Unknown")
                          .replaceAll("_", " ")}
                      </strong>
                    </td>

                    <td>
                      <span className={statusClass(log.status)}>
                        {log.status || "Unknown"}
                      </span>
                    </td>

                    <td>{formatDate(log.executed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
