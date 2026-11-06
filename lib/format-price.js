export function formatPrice(price, currency = "USD") {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "Price unavailable";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
