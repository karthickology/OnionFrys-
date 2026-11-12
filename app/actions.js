
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Please sign in." };
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    return { success: false, message: "Administrator access required." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin");

  return { success: true, message: "Order status updated." };
}
