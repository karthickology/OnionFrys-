
"use client";

export function pushEcommerceEvent(eventName, ecommerce) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  // Clear previous ecommerce data
  window.dataLayer.push({
    ecommerce: null,
  });

  // Send the new ecommerce event
  window.dataLayer.push({
    event: eventName,
    ecommerce,
  });
}
