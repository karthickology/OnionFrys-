
"use client";

import { useEffect, useRef } from "react";
import {
  formatEcommerceItem,
  trackEcommerce,
} from "@/lib/data-layer";

export function ProductViewTracker({ product }) {
  const trackedProductId = useRef(null);

  useEffect(() => {
    if (!product?.id) return;

    if (trackedProductId.current === product.id) return;

    trackedProductId.current = product.id;

    trackEcommerce("view_item", {
      currency: product.currency || "USD",
      value: Number(product.price || 0),
      items: [formatEcommerceItem(product, 1)],
    });
  }, [product]);

  return null;
}
