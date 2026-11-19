
"use client";

import { useEffect, useState } from "react";
import { getExperimentAssignment } from "@/lib/ab-testing";

export function ExperimentDescription({ product }) {
  const [variant, setVariant] = useState("A");

  useEffect(() => {
    setVariant(getExperimentAssignment());
  }, []);

  const descriptions = {
    A:
      product.description ||
      "Discover this item from the OnionFrys collection.",

    B:
      `A demo T-shirt from the OnionFrys collection, priced at $${Number(
        product.price
      ).toFixed(2)}. Check current stock before ordering.`,
  };

  return (
    <p className="product-detail-description">
      {descriptions[variant]}
    </p>
  );
}
