
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import {
  cartEventName,
  readCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart-storage";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(readCart());

    refresh();
    setReady(true);

    const eventName = cartEventName();

    window.addEventListener(eventName, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(eventName, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [items]
  );

  function changeQuantity(item, value) {
    const quantity = Math.max(
      1,
      Math.min(
        Number(value) || 1,
        Number(item.stock) || 1
      )
    );

    updateCartItem(item.variantId, quantity);
    setItems(readCart());
  }

  return (
    <main className="cart-page">
      <div className="cart-topbar">
        <Link href="/products">← Continue shopping</Link>
        <Link href="/">OnionFrys</Link>
      </div>

      <h1>Your cart</h1>

      {!ready ? (
        <p>Loading cart…</p>
      ) : items.length === 0 ? (
        <section className="cart-empty">
          <p>Your cart is empty.</p>
          <Link href="/products" className="cart-primary-link">
            Browse products
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {items.map((item) => (
              <article
                className="cart-item"
                key={item.variantId}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || item.name}
                  />
                ) : (
                  <div className="cart-image-placeholder" />
                )}

                <div className="cart-item-info">
                  <Link href={`/products/${item.slug}`}>
                    {item.name}
                  </Link>

                  <p>
                    {item.sku
                      ? `SKU: ${item.sku}`
                      : "Standard item"}
                  </p>

                  <strong>
                    {formatPrice(item.price, item.currency)}
                  </strong>

                  <div className="cart-item-actions">
                    <label>
                      Qty
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(event) =>
                          changeQuantity(item, event.target.value)
                        }
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        removeCartItem(item.variantId);
                        setItems(readCart());
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <strong>
                  {formatPrice(
                    Number(item.price) *
                      Number(item.quantity),
                    item.currency
                  )}
                </strong>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order summary</h2>

            <div>
              <span>Subtotal</span>
              <strong>
                {formatPrice(
                  subtotal,
                  items[0]?.currency || "USD"
                )}
              </strong>
            </div>

            <p>
              Shipping, discounts and final prices are
              calculated at checkout.
            </p>

            <button type="button" disabled>
              Checkout — available in Module 4C
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
