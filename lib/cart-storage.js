
"use client";

const CART_KEY = "onionfrys_cart_v1";
const EVENT_NAME = "onionfrys-cart-updated";

export function readCart() {
  if (typeof window === "undefined") return [];

  try {
    const cart = JSON.parse(
      window.localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function writeCart(items) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify(items)
  );

  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function addCartItem(product) {
  const cart = readCart();

  const existing = cart.find(
    (item) => item.variantId === product.variantId
  );

  let updatedCart;

  if (existing) {
    updatedCart = cart.map((item) =>
      item.variantId === product.variantId
        ? {
            ...item,
            quantity: Math.min(
              item.quantity + 1,
              item.stock
            ),
          }
        : item
    );
  } else {
    updatedCart = [
      ...cart,
      {
        ...product,
        quantity: 1,
      },
    ];
  }

  writeCart(updatedCart);
  return updatedCart;
}

export function updateCartItem(variantId, quantity) {
  const updatedCart = readCart().map((item) =>
    item.variantId === variantId
      ? { ...item, quantity }
      : item
  );

  writeCart(updatedCart);
  return updatedCart;
}

export function removeCartItem(variantId) {
  const updatedCart = readCart().filter(
    (item) => item.variantId !== variantId
  );

  writeCart(updatedCart);
  return updatedCart;
}

export function cartEventName() {
  return EVENT_NAME;
}
