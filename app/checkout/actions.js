
"use server";

import { createClient } from "@/lib/supabase/server";

export async function createOrder(input) {
  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase is not configured." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Please sign in before placing your order.",
      redirectTo: "/login?next=/checkout",
    };
  }

  if (!user.email) {
    return { success: false, message: "Your account has no email address." };
  }

  const items = input?.items;

  if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
    return { success: false, message: "Your cart is empty or invalid." };
  }

  const validItems = items.map((item) => ({
    variant_id: item.variantId,
    quantity: Number(item.quantity),
  }));

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (
    validItems.some(
      (item) =>
        !uuidPattern.test(item.variant_id || "") ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
    )
  ) {
    return { success: false, message: "Invalid cart items. Refresh your cart." };
  }

  const address = input?.shippingAddress || {};

  const requiredFields = [
    "full_name",
    "phone",
    "address_line",
    "city",
    "country",
  ];

  if (requiredFields.some((field) => !String(address[field] || "").trim())) {
    return { success: false, message: "Complete all required shipping fields." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data, error } = await supabase.rpc("create_simulated_order", {
    p_customer_email: user.email,
    p_customer_name:
      profile?.full_name || user.user_metadata?.full_name || "",
    p_shipping_address: {
      full_name: String(address.full_name).trim(),
      phone: String(address.phone).trim(),
      address_line: String(address.address_line).trim(),
      city: String(address.city).trim(),
      country: String(address.country).trim(),
      postal_code: String(address.postal_code || "").trim(),
    },
    p_items: validItems,
    p_coupon_code: String(input?.couponCode || "").trim() || null,
    p_payment_outcome: "success",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data?.success) {
    return {
      success: false,
      message: "The simulated payment was unsuccessful.",
    };
  }

  return {
    success: true,
    orderNumber: data.order_number,
    total: data.total,
    currency: data.currency,
  };
}
