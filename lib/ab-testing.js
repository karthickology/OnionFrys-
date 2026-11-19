
"use client";

const EXPERIMENT_ID = "product_description_test";
const STORAGE_KEY = `onionfrys_experiment_${EXPERIMENT_ID}`;

export function getExperimentAssignment() {
  if (typeof window === "undefined") {
    return "A";
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);

    if (existing === "A" || existing === "B") {
      return existing;
    }

    const assignment = Math.random() < 0.5 ? "A" : "B";

    window.localStorage.setItem(STORAGE_KEY, assignment);

    return assignment;
  } catch {
    return "A";
  }
}

export function getExperimentDetails() {
  return {
    experiment_id: EXPERIMENT_ID,
    experiment_variant: getExperimentAssignment(),
  };
}
