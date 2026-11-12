
"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format-price";
import { updateOrderStatus } from "@/app/admin/actions";

const statuses = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "failed",
];

export default function AdminOrders({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  async function saveStatus(orderId, currentStatus) {
    const newStatus = drafts[orderId] || currentStatus;

    if (newStatus === currentStatus) {
      setMessage("No status change to save.");
      return;
    }

    setSavingId(orderId);
    setMessage("");

    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setDrafts((current) => {
        const updated = { ...current };
        delete updated[orderId];
        return updated;
      });

      setMessage(result.message);
    } catch {
      setMessage("Unable to update order status.");
    } finally {
      setSavingId("");
    }
  }

  if (orders.length === 0) {
    return <p className="muted">No orders have been placed yet.</p>;
  }

  return (
    <div>
      {message && (
        <p className="muted" role="status">{message}</p>
      )}

      {orders.map((order) => (
        <article
          key={order.id}
          className="admin-card"
          style={{ marginTop: 20 }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12
          }}>
            <div>
              <h2>{order.order_number}</h2>
              <p className="muted">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <strong>{formatPrice(Number(order.total))}</strong>
              <p className="muted">
                Payment: {order.payment_status}
              </p>
            </div>
          </div>

          <hr />

          <p><strong>Customer:</strong> {order.customer_name || "Not provided"}</p>
          <p><strong>Email:</strong> {order.customer_email}</p>
          <p><strong>Order status:</strong> {order.status}</p>

          <h3>Purchased products</h3>

          {(order.order_items || []).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <strong>{formatPrice(Number(item.line_total))}</strong>
            </div>
          ))}

          <div style={{ marginTop: 18 }}>
            <label>
              Update order status
              <select
                value={drafts[order.id] || order.status}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [order.id]: event.target.value,
                  }))
                }
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: 300,
                  padding: 10,
                  marginTop: 8,
                }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="button primary"
              type="button"
              disabled={savingId === order.id}
              onClick={() => saveStatus(order.id, order.status)}
              style={{ marginTop: 12 }}
            >
              {savingId === order.id ? "Saving..." : "Save status"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
