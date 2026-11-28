
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "failed",
];

async function getAdminClient() {
  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in." };
  }

  const { data: isAdmin, error } =
    await supabase.rpc("is_admin");

  if (error || isAdmin !== true) {
    return { error: "Administrator access required." };
  }

  return { supabase };
}

export async function updateOrderStatus(orderId, newStatus) {
  if (!allowedStatuses.includes(newStatus)) {
    return {
      success: false,
      message: "Invalid order status.",
    };
  }

  const { supabase, error: authError } =
    await getAdminClient();

  if (authError) {
    return { success: false, message: authError };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select("id, status")
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data) {
    return {
      success: false,
      message: "No order was updated. Check database permissions.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    status: data.status,
    message: `Order status saved as ${data.status}.`,
  };
}

export async function createProduct(formData) {
  const { supabase, error: authError } =
    await getAdminClient();

  if (authError) {
    return { success: false, message: authError };
  }

  const name = String(formData.name || "").trim();
  const slug = String(formData.slug || "")
    .trim()
    .toLowerCase();

  const description =
    String(formData.description || "").trim();

  const price = Number(formData.price);

  const comparePrice =
    formData.compare_at_price === "" ||
    formData.compare_at_price == null
      ? null
      : Number(formData.compare_at_price);

  const currency = String(
    formData.currency || "AED"
  ).trim().toUpperCase();

  const status = String(
    formData.status || "draft"
  ).trim();

  const isFeatured = formData.is_featured === true;

  if (!name || !slug) {
    return {
      success: false,
      message: "Product name and slug are required.",
    };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      success: false,
      message: "Use a valid slug, such as mini-desk-lamp.",
    };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return {
      success: false,
      message: "Enter a valid product price.",
    };
  }

  if (
    comparePrice !== null &&
    (!Number.isFinite(comparePrice) ||
      comparePrice <= price)
  ) {
    return {
      success: false,
      message: "Compare-at price must be higher than the selling price.",
    };
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    return {
      success: false,
      message: "Enter a valid 3-letter currency code, such as AED.",
    };
  }

  if (!["draft", "published"].includes(status)) {
    return {
      success: false,
      message: "Invalid product status.",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: description || null,
      price,
      compare_at_price: comparePrice,
      currency,
      status,
      is_featured: isFeatured,
    })
    .select("id, name, slug")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");

  return {
    success: true,
    product: data,
    message: "Product created successfully.",
  };
}
