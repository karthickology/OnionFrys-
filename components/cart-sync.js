
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  readCart,
  writeCart,
  cartEventName,
} from "@/lib/cart-storage";

export default function CartSync() {
  useEffect(() => {
    const supabase = createClient();

    if (!supabase) return;

    let active = true;
    let syncing = false;
    let currentUser = null;
    let currentUserId = null;
    let changedDuringSync = false;

    function mergeCarts(localItems, remoteItems) {
      const merged = new Map();

      [...remoteItems, ...localItems].forEach((item) => {
        const existing = merged.get(item.variantId);

        if (!existing) {
          merged.set(item.variantId, { ...item });
          return;
        }

        merged.set(item.variantId, {
          ...existing,
          ...item,
          quantity: Math.min(
            Math.max(
              Number(existing.quantity || 1),
              Number(item.quantity || 1)
            ),
            Number(item.stock || existing.stock || 999)
          ),
        });
      });

      return Array.from(merged.values());
    }

    async function saveCart(user) {
      if (!user || !active) return;

      const items = readCart();

      const subtotal = items.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 1),
        0
      );

      const { data: existingCart, error: fetchError } =
        await supabase
          .from("customer_carts")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();

      if (fetchError) {
        console.error("Cart status retrieval failed:", fetchError.message);
        return;
      }

      if (!active) return;

      const isConverted =
        items.length === 0 &&
        existingCart?.status === "converted";

      const now = new Date().toISOString();

      const { error } = await supabase
        .from("customer_carts")
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            items,
            currency: items[0]?.currency || "USD",
            subtotal,
            status: isConverted ? "converted" : "active",
            last_activity_at: isConverted
              ? undefined
              : now,
            updated_at: now,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Cart sync failed:", error.message);
      }
    }

    async function syncUser(user) {
      if (!user || !active || syncing) return;

      syncing = true;
      currentUser = user;
      currentUserId = user.id;
      changedDuringSync = false;

      const { data, error } = await supabase
        .from("customer_carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Cart retrieval failed:", error.message);
        syncing = false;
        return;
      }

      if (!active) {
        syncing = false;
        return;
      }

      const remoteItems = Array.isArray(data?.items)
        ? data.items
        : [];

      const mergedItems = mergeCarts(
        readCart(),
        remoteItems
      );

      writeCart(mergedItems);

      syncing = false;

      await saveCart(user);

      if (changedDuringSync && active) {
        changedDuringSync = false;
        await saveCart(user);
      }
    }

    function cartHandler() {
      if (!currentUser) return;

      if (syncing) {
        changedDuringSync = true;
        return;
      }

      saveCart(currentUser);
    }

    window.addEventListener(cartEventName(), cartHandler);

    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Authentication check failed:", error.message);
        return;
      }

      if (data.user && active) {
        syncUser(data.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;

      currentUser = user;

      if (!user) {
        currentUserId = null;
        return;
      }

      if (user.id !== currentUserId) {
        syncUser(user);
      }
    });

    return () => {
      active = false;
      window.removeEventListener(cartEventName(), cartHandler);
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
