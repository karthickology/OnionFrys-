
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format-price";
import { readCart, writeCart } from "@/lib/cart-storage";
import { createOrder } from "@/app/checkout/actions";

export default function CheckoutForm({ customerEmail, customerName }) {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const [address, setAddress] = useState({
    full_name: customerName || "",
    phone: "",
    address_line: "",
    city: "",
    country: "",
    postal_code: "",
  });

  useEffect(() => {
    setItems(readCart());
  }, []);

  function updateAddress(event) {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await createOrder({
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        couponCode,
      });

      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }

      if (!result.success) {
        setMessage(result.message || "Unable to place your order.");
        return;
      }

      writeCart([]);
      setItems([]);
      setOrderNumber(result.orderNumber || "");
      setMessage("Your order was placed successfully!");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  if (orderNumber) {
    return (
      <section className="checkout-card">
        <div className="eyebrow">Order confirmed</div>
        <h1>Thank you!</h1>
        <p>{message}</p>
        <p>
          Order number: <strong>{orderNumber}</strong>
        </p>
        <Link className="checkout-button" href="/account">
          Go to my account
        </Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout-card">
        <h1>Your cart is empty</h1>
        <p>Add products before proceeding to checkout.</p>
        <Link className="checkout-button" href="/">
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout-layout">
      <div className="checkout-card">
        <div className="eyebrow">Secure checkout</div>
        <h1>Complete your order</h1>
        <p className="checkout-muted">
          Signed in as {customerEmail}
        </p>

        <form onSubmit={handleSubmit}>
          <h2>Shipping information</h2>

          <label>
            Full name
            <input
              name="full_name"
              value={address.full_name}
              onChange={updateAddress}
              maxLength={100}
              required
            />
          </label>

          <label>
            Phone number
            <input
              name="phone"
              type="tel"
              value={address.phone}
              onChange={updateAddress}
              maxLength={30}
              required
            />
          </label>

          <label>
            Address
            <input
              name="address_line"
              value={address.address_line}
              onChange={updateAddress}
              maxLength={250}
              required
            />
          </label>

          <label>
            City
            <input
              name="city"
              value={address.city}
              onChange={updateAddress}
              maxLength={100}
              required
            />
          </label>

          <label>
            Country
            <input
              name="country"
              value={address.country}
              onChange={updateAddress}
              maxLength={100}
              required
            />
          </label>

          <label>
            Postal code (optional)
            <input
              name="postal_code"
              value={address.postal_code}
              onChange={updateAddress}
              maxLength={20}
            />
          </label>

          <h2>Coupon</h2>
          <label>
            Coupon code (optional)
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              maxLength={50}
              placeholder="Enter coupon code"
            />
          </label>

          <h2>Payment</h2>
          <p className="checkout-muted">
            Demo payment only. No real payment will be collected.
          </p>

          {message && (
            <p className="checkout-message" role="alert">
              {message}
            </p>
          )}

          <button
            className="checkout-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Place demo order"}
          </button>
        </form>
      </div>

      <aside className="checkout-card checkout-summary">
        <h2>Your order</h2>

        {items.map((item) => (
          <div className="checkout-item" key={item.variantId}>
            <span>
              {item.name || item.productName || item.title || "Product"} ×{" "}
              {item.quantity}
            </span>
            <strong>
              {formatPrice(
                Number(item.price || 0) * Number(item.quantity || 0)
              )}
            </strong>
          </div>
        ))}

        <div className="checkout-total">
          <span>Estimated subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>

        <p className="checkout-muted">
          Final prices, stock and any coupon discount are calculated by the
          database when you place the order. Shipping is currently free.
        </p>

        <Link className="checkout-back" href="/cart">
          Back to cart
        </Link>
      </aside>
    </section>
  );
}
