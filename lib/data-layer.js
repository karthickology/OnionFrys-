
"use client";

// Initialize the dataLayer
function getDataLayer() {
  if (typeof window === "undefined") return null;

  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

// Send a general event
export function pushDataLayerEvent(eventName, parameters = {}) {
  const dataLayer = getDataLayer();

  if (!dataLayer) return;

  dataLayer.push({
    ...parameters,
    event: eventName,
  });
}

// Convert OnionFrys product data into GA4 format
export function formatEcommerceItem(product, quantity = 1) {
  return {
    item_id: String(product.productId || product.id || ""),
    item_name: product.name || "",
    item_variant: product.variantId || "",
    item_sku: product.sku || "",
    price: Number(product.price || 0),
    quantity: Number(quantity || 1),
  };
}

// Send ecommerce events
export function pushEcommerceEvent(eventName, ecommerce = {}) {
  const dataLayer = getDataLayer();

  if (!dataLayer) return;

  // Clear previous ecommerce information
  dataLayer.push({
    ecommerce: null,
  });

  dataLayer.push({
    event: eventName,
    ecommerce,
  });
}

// Reusable function for all ecommerce events
export function trackEcommerce(eventName, {
  items = [],
  currency = "USD",
  value,
  ...extraParameters
} = {}) {
  const formattedItems = items;

  const calculatedValue = formattedItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  pushEcommerceEvent(eventName, {
    currency,
    value: value ?? calculatedValue,
    items: formattedItems,
    ...extraParameters,
  });
}
