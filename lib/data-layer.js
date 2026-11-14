
"use client";

// ==========================================
// 1. CENTRAL EVENT CONFIGURATION
// ==========================================

export const CLICK_EVENT_RULES = [
  // Add simple click-tracking rules here.
  // Example:
  // {
  //   selector: ".wishlist-button",
  //   eventName: "wishlist_click",
  // }
];

// ==========================================
// 2. DATA LAYER INITIALIZATION
// ==========================================

function getDataLayer() {
  if (typeof window === "undefined") return null;

  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

// ==========================================
// 3. GENERAL EVENT TRACKING
// ==========================================

export function pushDataLayerEvent(eventName, parameters = {}) {
  const dataLayer = getDataLayer();

  if (!dataLayer || !eventName) return;

  dataLayer.push({
    ...parameters,
    event: eventName,
  });
}

// ==========================================
// 4. CENTRAL CLICK TRACKING
// ==========================================

let trackingInitialized = false;

export function initializeTracking() {
  if (
    typeof document === "undefined" ||
    trackingInitialized
  ) {
    return;
  }

  trackingInitialized = true;

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    CLICK_EVENT_RULES.forEach((rule) => {
      const element = target.closest(rule.selector);

      if (!element) return;

      pushDataLayerEvent(rule.eventName, {
        click_text: element.textContent?.trim().slice(0, 100) || "",
        click_url: element.getAttribute("href") || "",
        ...rule.parameters,
      });
    });
  });
}

// ==========================================
// 5. GA4 ECOMMERCE ITEM FORMAT
// ==========================================

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

// ==========================================
// 6. ECOMMERCE EVENT TRACKING
// ==========================================

export function pushEcommerceEvent(eventName, ecommerce = {}) {
  const dataLayer = getDataLayer();

  if (!dataLayer || !eventName) return;

  dataLayer.push({
    ecommerce: null,
  });

  dataLayer.push({
    event: eventName,
    ecommerce,
  });
}

// ==========================================
// 7. REUSABLE ECOMMERCE FUNCTION
// ==========================================

export function trackEcommerce(
  eventName,
  {
    items = [],
    currency = "USD",
    value,
    ...extraParameters
  } = {}
) {
  const formattedItems = Array.isArray(items) ? items : [];

  const calculatedValue = formattedItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
      Number(item.quantity || 1),
    0
  );

  pushEcommerceEvent(eventName, {
    ...extraParameters,
    currency,
    value: value ?? calculatedValue,
    items: formattedItems,
  });
}
