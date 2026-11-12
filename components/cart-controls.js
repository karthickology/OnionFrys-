
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addCartItem,
  cartEventName,
  readCart,
} from "@/lib/cart-storage";

export function AddToCartButton({ product, className = "" }) {
  const [added, setAdded] = useState(false);

  const canAdd =
    Boolean(product?.variantId) &&
    Number(product?.stock) > 0;

  function handleAdd() {
    if (!canAdd) return;

    addCartItem({
      productId: product.id,
      variantId: product.variantId,
      name: product.name,
      slug: product.slug,
      sku: product.sku || "",
      price: Number(product.price),
      currency: product.currency || "USD",
      imageUrl: product.image?.url || "",
      imageAlt: product.image?.alt || product.name,
      stock: Number(product.stock),
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      className={`cart-add-button ${className}`}
      onClick={handleAdd}
      disabled={!canAdd}
    >
      {!product?.variantId
        ? "Unavailable"
        : Number(product?.stock) <= 0
          ? "Out of stock"
          : added
            ? "Added to cart"
            : "Add to cart"}
    </button>
  );
}

export function CartLink({ className = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setCount(
        readCart().reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )
      );
    };

    refresh();

    const eventName = cartEventName();

    window.addEventListener(eventName, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(eventName, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Link href="/cart" className={`cart-link ${className}`}>
      Cart ({count})
    </Link>
  );
}
