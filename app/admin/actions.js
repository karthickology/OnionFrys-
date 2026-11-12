
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

export async function updateOrderStatus(orderId, newStatus) {
  if (!allowedStatuses.includes(newStatus)) {
    return { success: false, message: "Invalid order status." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Supabase is not configured." };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Please sign in." };
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    return { success: false, message: "Administrator access required." };
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
      message: "No order was updated. Check the database permissions.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    message: `Order status saved as ${data.status}.`,
  };
}
