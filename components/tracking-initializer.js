
"use client";

import { useEffect } from "react";
import { initializeTracking } from "@/lib/data-layer";

export default function TrackingInitializer() {
  useEffect(() => {
    initializeTracking();
  }, []);

  return null;
}
