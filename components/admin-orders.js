
"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format-price";
import { updateOrderStatus } from "@/app/admin/actions";

const statuses = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "failed",
];

function statusClass(status) {
  return `admin-order-status ${String(status || "pending").toLowerCase()}`;
}

export default function AdminOrders({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState("");
  const [messages, setMessages] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        (order.order_number || "").toLowerCase().includes(term) ||
        (order.customer_name || "").toLowerCase().includes(term) ||
        (order.customer_email || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  async function saveStatus(orderId, currentStatus) {
    const newStatus = drafts[orderId] || currentStatus;

    if (newStatus === currentStatus) {
      setMessages((current) => ({
        ...current,
        [orderId]: "No status change selected.",
      }));
      return;
    }

    setSavingId(orderId);
    setMessages((current) => ({
      ...current,
      [orderId]: "Saving status...",
    }));

    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (!result || !result.success) {
        setMessages((current) => ({
          ...current,
          [orderId]: result?.message || "Status update failed.",
        }));
        return;
      }

      const savedStatus = result.status || newStatus;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: savedStatus }
            : order
        )
      );

      setDrafts((current) => {
        const updated = { ...current };
        delete updated[orderId];
        return updated;
      });

      setMessages((current) => ({
        ...current,
        [orderId]: result.message || `Status saved as ${savedStatus}.`,
      }));
    } catch (error) {
      setMessages((current) => ({
        ...current,
        [orderId]: error?.message || "Unable to update order status.",
      }));
    } finally {
      setSavingId("");
    }
  }

  if (orders.length === 0) {
    return (
      <div className="admin-empty-state">
        <h3>No orders yet</h3>
        <p className="muted">Customer orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="admin-orders-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order number, customer or email..."
          aria-label="Search orders"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter orders by status"
        >
          <option value="all">All order statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <span className="admin-result-count">
          {filteredOrders.length} of {orders.length} orders
        </span>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-products-table admin-orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Products</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Order status</th>
              <th>Update status</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.order_number || "—"}</strong>
                </td>

                <td>
                  <div className="admin-order-customer">
                    <strong>{order.customer_name || "Guest customer"}</strong>
                    <small>{order.customer_email || "No email"}</small>
                  </div>
                </td>

                <td>
                  {new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  <small className="admin-order-time">
                    {new Date(order.created_at).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </td>

                <td>
                  <div className="admin-order-items">
                    {(order.order_items || []).map((item) => (
                      <div key={item.id}>
                        {item.product_name} <span>× {item.quantity}</span>
                      </div>
                    ))}
                    {(!order.order_items || order.order_items.length === 0) && (
                      <span className="admin-muted-label">No items listed</span>
                    )}
                  </div>
                </td>

                <td>
                  <strong>
                    {formatPrice(Number(order.total))}
                  </strong>
                </td>

                <td>
                  <span className={statusClass(order.payment_status)}>
                    {order.payment_status || "Unknown"}
                  </span>
                </td>

                <td>
                  <span className={statusClass(order.status)}>
                    {order.status || "Unknown"}
                  </span>
                </td>

                <td>
                  <div className="admin-order-update">
                    <select
                      value={drafts[order.id] ?? order.status}
                      disabled={savingId === order.id}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [order.id]: event.target.value,
                        }))
                      }
                      aria-label={`New status for ${order.order_number}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      className="button primary admin-order-save"
                      type="button"
                      disabled={savingId === order.id}
                      onClick={() => saveStatus(order.id, order.status)}
                    >
                      {savingId === order.id ? "Saving..." : "Save"}
                    </button>

                    {messages[order.id] && (
                      <small className="admin-order-message" role="status">
                        {messages[order.id]}
                      </small>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="admin-empty-state">
            <h3>No matching orders</h3>
            <p className="muted">
              Try a different search or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
